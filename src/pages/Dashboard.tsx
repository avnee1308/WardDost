import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  AlertTriangle, 
  Droplets, 
  TrendingUp,
  Phone,
  FileText,
  Shield,
  ChevronRight,
  CloudRain
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ward {
  id: string;
  name: string;
  pincode: string;
  basin: string;
  avg_rainfall_mm: number;
  drain_capacity_mm: number;
  risk_level: 'low' | 'medium' | 'high';
  silt_management_status: string | null;
  rating: number;
}

const Dashboard = () => {
  const [searchType, setSearchType] = useState<'ward' | 'pincode'>('ward');
  const [searchValue, setSearchValue] = useState('');
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  
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
  }, []);

  const fetchWards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wards')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load wards data',
        variant: 'destructive',
      });
    } else {
      setWards(data as Ward[]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    let found: Ward | undefined;
    if (searchType === 'ward') {
      found = wards.find(w => w.name.toLowerCase().includes(searchValue.toLowerCase()));
    } else {
      found = wards.find(w => w.pincode === searchValue);
    }

    if (found) {
      setSelectedWard(found);
    } else {
      toast({
        title: 'Not Found',
        description: 'No ward found with the given search criteria',
        variant: 'destructive',
      });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskGradient = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'from-red-500 to-orange-500';
      case 'medium':
        return 'from-yellow-500 to-amber-500';
      case 'low':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-400';
    }
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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isAuthority ? 'Authority Dashboard' : 'Citizen Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {isAuthority 
                  ? 'Manage complaints and monitor ward conditions'
                  : 'Check water logging risk in your area'}
              </p>
            </div>
            {isAuthority && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Authority Access</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Find Your Area
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="mb-2 block">Search by</Label>
              <Select
                value={searchType}
                onValueChange={(v) => setSearchType(v as 'ward' | 'pincode')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ward">Ward Name</SelectItem>
                  <SelectItem value="pincode">Pincode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-[2]">
              <Label className="mb-2 block">
                {searchType === 'ward' ? 'Select Ward' : 'Enter Pincode'}
              </Label>
              {searchType === 'ward' ? (
                <Select
                  value={searchValue || undefined}
                  onValueChange={setSearchValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.name}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter 6-digit pincode"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  maxLength={6}
                />
              )}
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Check Status
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Selected Ward Details */}
        {selectedWard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              {/* Ward Header */}
              <div className={`p-6 bg-gradient-to-r ${getRiskGradient(selectedWard.risk_level)} text-white`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedWard.name}</h3>
                    <p className="opacity-90">{selectedWard.basin}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Risk Level</div>
                    <div className="text-xl font-bold uppercase">{selectedWard.risk_level}</div>
                  </div>
                </div>
              </div>

              {/* Ward Stats */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <CloudRain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avg. Rainfall</div>
                    <div className="text-xl font-bold">{selectedWard.avg_rainfall_mm} mm</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Drain Capacity</div>
                    <div className="text-xl font-bold">{selectedWard.drain_capacity_mm} mm</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ward Rating</div>
                    <div className="text-xl font-bold">{selectedWard.rating?.toFixed(1) || '3.0'}/5.0</div>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="px-6 pb-6">
                <div className={`p-4 rounded-xl ${
                  selectedWard.avg_rainfall_mm > selectedWard.drain_capacity_mm
                    ? 'bg-destructive/10 border border-destructive/20'
                    : 'bg-success/10 border border-success/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      selectedWard.avg_rainfall_mm > selectedWard.drain_capacity_mm
                        ? 'text-destructive'
                        : 'text-success'
                    }`} />
                    <div>
                      <h4 className="font-semibold">
                        {selectedWard.avg_rainfall_mm > selectedWard.drain_capacity_mm
                          ? 'Water Logging Risk Detected'
                          : 'Area is Safe'}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedWard.avg_rainfall_mm > selectedWard.drain_capacity_mm
                          ? `Rainfall (${selectedWard.avg_rainfall_mm}mm) exceeds drain capacity (${selectedWard.drain_capacity_mm}mm). Consider alternate routes.`
                          : `Drain capacity (${selectedWard.drain_capacity_mm}mm) can handle expected rainfall (${selectedWard.avg_rainfall_mm}mm).`}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedWard.silt_management_status && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-xl">
                    <h4 className="font-medium mb-1">Maintenance Status</h4>
                    <p className="text-sm text-muted-foreground">{selectedWard.silt_management_status}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => navigate('/complaints')}
            className="group p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              {isAuthority ? 'Manage Complaints' : 'Report Issue'}
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">
              {isAuthority ? 'Review and resolve citizen complaints' : 'Report blocked drains or water logging'}
            </p>
          </button>

          <button
            onClick={() => navigate('/emergency')}
            className="group p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all text-left"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              Emergency Contacts
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Access hospitals and PWD engineer contacts
            </p>
          </button>

          {isAuthority && (
            <button
              onClick={() => navigate('/complaints')}
              className="group p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                Update Ward Stats
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Correct missing or incorrect ward data
              </p>
            </button>
          )}
        </motion.div>

        {/* All Wards Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold mb-4">All Wards Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {wards.map((ward) => (
              <button
                key={ward.id}
                onClick={() => setSelectedWard(ward)}
                className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
                  selectedWard?.id === ward.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{ward.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(ward.risk_level)}`}>
                    {ward.risk_level}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {ward.basin}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  PIN: {ward.pincode}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
