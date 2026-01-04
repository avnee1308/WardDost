-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('citizen', 'authority');

-- Create enum for complaint status
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved', 'rejected');

-- Create enum for risk level
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create wards table
CREATE TABLE public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pincode TEXT NOT NULL,
  basin TEXT NOT NULL,
  avg_rainfall_mm NUMERIC DEFAULT 0,
  drain_capacity_mm NUMERIC DEFAULT 0,
  risk_level risk_level DEFAULT 'low',
  silt_management_status TEXT,
  last_maintenance_date DATE,
  rating NUMERIC DEFAULT 3.0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status complaint_status DEFAULT 'pending',
  is_resolved BOOLEAN DEFAULT false,
  resolution_rating INTEGER CHECK (resolution_rating >= 1 AND resolution_rating <= 5),
  work_started_within_week BOOLEAN,
  authority_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create complaint_images table
CREATE TABLE public.complaint_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table (for complaint images)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  helpfulness_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create review_votes table (to track helpful/not helpful votes)
CREATE TABLE public.review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(review_id, user_id)
);

-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
  contact_type TEXT NOT NULL, -- 'hospital', 'pwd_engineer', etc.
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create water_logging_history table for analytics
CREATE TABLE public.water_logging_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  rainfall_mm NUMERIC NOT NULL,
  water_logged BOOLEAN DEFAULT false,
  severity risk_level,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logging_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Wards policies (public read, authority write)
CREATE POLICY "Anyone can view wards" ON public.wards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can update wards" ON public.wards FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);
CREATE POLICY "Authorities can insert wards" ON public.wards FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Complaints policies
CREATE POLICY "Users can view all complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own complaints" ON public.complaints FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Complaint images policies
CREATE POLICY "Anyone can view complaint images" ON public.complaint_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload complaint images" ON public.complaint_images FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Review votes policies
CREATE POLICY "Anyone can view review votes" ON public.review_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote on reviews" ON public.review_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.review_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Anyone can view emergency contacts" ON public.emergency_contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can manage emergency contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Water logging history policies
CREATE POLICY "Anyone can view water logging history" ON public.water_logging_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorities can manage history" ON public.water_logging_history FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'authority')
);

-- Create function to handle new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON public.wards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample wards data for Delhi
INSERT INTO public.wards (name, pincode, basin, avg_rainfall_mm, drain_capacity_mm, risk_level, silt_management_status) VALUES
('Najafgarh', '110043', 'Najafgarh Basin', 85, 60, 'high', 'Requires immediate silt management'),
('Dwarka', '110075', 'Najafgarh Basin', 75, 80, 'medium', 'Regular maintenance scheduled'),
('Rohini', '110085', 'Yamuna Basin', 70, 75, 'medium', 'Silt cleared last month'),
('Karol Bagh', '110005', 'Central Delhi Basin', 65, 70, 'low', 'Well maintained'),
('Shahdara', '110032', 'Trans-Yamuna Basin', 80, 55, 'high', 'Critical - requires attention'),
('Saket', '110017', 'South Delhi Basin', 60, 85, 'low', 'Excellent condition'),
('Lajpat Nagar', '110024', 'South Delhi Basin', 72, 68, 'medium', 'Minor blockages reported'),
('Pitampura', '110034', 'North Delhi Basin', 78, 62, 'high', 'Silt accumulation detected');

-- Insert sample emergency contacts
INSERT INTO public.emergency_contacts (ward_id, contact_type, name, phone, address) 
SELECT id, 'hospital', 'District Hospital', '011-23456789', 'Main Road, Ward Area'
FROM public.wards;

INSERT INTO public.emergency_contacts (ward_id, contact_type, name, phone, address)
SELECT id, 'pwd_engineer', 'PWD Control Room', '011-98765432', 'PWD Office, Ward Area'
FROM public.wards;