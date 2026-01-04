import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Upload, 
  MapPin, 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  X,
  Send
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ward {
  id: string;
  name: string;
  pincode: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  is_resolved: boolean;
  resolution_rating: number | null;
  work_started_within_week: boolean | null;
  created_at: string;
  user_id: string;
  ward_id: string;
  authority_notes: string | null;
  wards?: {
    name: string;
  };
}

interface Review {
  id: string;
  content: string;
  rating: number;
  helpfulness_score: number;
  created_at: string;
  user_id: string;
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' },
  in_progress: { icon: AlertCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Resolved' },
  rejected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejected' },
};

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    ward_id: '',
  });

  const { user, isAuthority, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchWards();
    fetchComplaints();
  }, []);

  const fetchWards = async () => {
    const { data } = await supabase
      .from('wards')
      .select('id, name, pincode')
      .order('name');
    if (data) setWards(data);
  };

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        wards (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load complaints',
        variant: 'destructive',
      });
    } else {
      setComplaints(data as Complaint[]);
    }
    setLoading(false);
  };

  const fetchReviews = async (complaintId: string) => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false });
    
    if (data) setReviews(data as Review[]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Create complaint
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          ward_id: formData.ward_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (complaintError) throw complaintError;

      // Upload image if exists
      if (imageFile && complaint) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${complaint.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(filePath, imageFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('complaint-images')
            .getPublicUrl(filePath);

          await supabase
            .from('complaint_images')
            .insert({
              complaint_id: complaint.id,
              image_url: publicUrl,
              uploaded_by: user.id,
            });
        }
      }

      toast({
        title: 'Success',
        description: 'Your complaint has been submitted successfully',
      });

      setIsDialogOpen(false);
      setFormData({ title: '', description: '', location: '', ward_id: '' });
      setImageFile(null);
      setImagePreview(null);
      fetchComplaints();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit complaint',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (complaintId: string, status: 'pending' | 'in_progress' | 'resolved' | 'rejected') => {
    const { error } = await supabase
      .from('complaints')
      .update({ status, is_resolved: status === 'resolved' })
      .eq('id', complaintId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
      fetchComplaints();
    }
  };

  const handleRateResolution = async (complaintId: string, rating: number) => {
    const { error } = await supabase
      .from('complaints')
      .update({ resolution_rating: rating })
      .eq('id', complaintId);

    if (!error) {
      toast({
        title: 'Thank you!',
        description: 'Your rating has been recorded',
      });
      fetchComplaints();
    }
  };

  const handleWorkStartedRating = async (complaintId: string, started: boolean) => {
    const { error } = await supabase
      .from('complaints')
      .update({ work_started_within_week: started })
      .eq('id', complaintId);

    if (!error) {
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded',
      });
      fetchComplaints();
    }
  };

  const handleAddReview = async () => {
    if (!selectedComplaint || !user || !newReview.content) return;

    const { error } = await supabase
      .from('reviews')
      .insert({
        complaint_id: selectedComplaint.id,
        user_id: user.id,
        content: newReview.content,
        rating: newReview.rating,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add review',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Review added successfully',
      });
      setNewReview({ content: '', rating: 5 });
      fetchReviews(selectedComplaint.id);
    }
  };

  const handleVoteReview = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('review_votes')
      .upsert({
        review_id: reviewId,
        user_id: user.id,
        is_helpful: isHelpful,
      });

    if (!error) {
      fetchReviews(selectedComplaint!.id);
    }
  };

  const openComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    fetchReviews(complaint.id);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">
              {isAuthority ? 'Manage Complaints' : 'Report Issues'}
            </h1>
            <p className="text-muted-foreground">
              {isAuthority 
                ? 'Review and take action on citizen complaints'
                : 'Report blocked drains and water logging in your area'}
            </p>
          </div>

          {!isAuthority && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  New Complaint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Report an Issue</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Ward</Label>
                    <Select
                      value={formData.ward_id || undefined}
                      onValueChange={(v) => setFormData({ ...formData, ward_id: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name} ({ward.pincode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter specific location"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label>Upload Photo</Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                          <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <Button type="submit" variant="hero" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Complaints List */}
        <div className="space-y-4">
          <AnimatePresence>
            {complaints.map((complaint, index) => {
              const status = statusConfig[complaint.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl border shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{complaint.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{complaint.location}</span>
                          {complaint.wards?.name && (
                            <>
                              <span>•</span>
                              <span>{complaint.wards.name}</span>
                            </>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {complaint.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openComplaintDetails(complaint)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Reviews
                        </Button>

                        {isAuthority && complaint.status !== 'resolved' && (
                          <Select
                            value={complaint.status}
                            onValueChange={(v) => handleStatusUpdate(complaint.id, v as 'pending' | 'in_progress' | 'resolved' | 'rejected')}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {/* Resolution Rating for User's Own Complaints */}
                    {complaint.user_id === user?.id && complaint.is_resolved && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Rate Resolution */}
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">Rate the resolution:</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRateResolution(complaint.id, star)}
                                  className={`p-1 ${
                                    (complaint.resolution_rating || 0) >= star
                                      ? 'text-warning'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  <Star className="h-5 w-5 fill-current" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Work Started Within Week */}
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">Work started within a week?</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={complaint.work_started_within_week === true ? 'success' : 'outline'}
                                onClick={() => handleWorkStartedRating(complaint.id, true)}
                              >
                                <ThumbsUp className="mr-1 h-4 w-4" />
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant={complaint.work_started_within_week === false ? 'destructive' : 'outline'}
                                onClick={() => handleWorkStartedRating(complaint.id, false)}
                              >
                                <ThumbsDown className="mr-1 h-4 w-4" />
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Authority Notes */}
                    {isAuthority && complaint.authority_notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {complaint.authority_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {complaints.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No complaints yet</h3>
              <p className="text-muted-foreground">
                {isAuthority
                  ? 'No complaints have been submitted yet'
                  : 'Be the first to report an issue in your area'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Reviews Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reviews & Comments</DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="mt-4">
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">{selectedComplaint.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedComplaint.description}</p>
              </div>

              {/* Add Review */}
              <div className="mb-6">
                <Label className="mb-2 block">Add your review</Label>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`p-1 ${
                        newReview.rating >= star ? 'text-warning' : 'text-muted-foreground'
                      }`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write your review..."
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    rows={2}
                  />
                  <Button onClick={handleAddReview} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-card rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        Anonymous
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              review.rating >= star ? 'text-warning fill-current' : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleVoteReview(review.id, true)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-success"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Helpful
                      </button>
                      <button
                        onClick={() => handleVoteReview(review.id, false)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Not helpful
                      </button>
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Complaints;
