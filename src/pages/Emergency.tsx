import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Building2, 
  Wrench, 
  MapPin,
  Search,
  AlertTriangle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
}

interface EmergencyContact {
  id: string;
  contact_type: string;
  name: string;
  phone: string;
  address: string | null;
  ward_id: string;
  wards?: {
    name: string;
  };
}

const Emergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchWards();
    fetchContacts();
  }, []);

  const fetchWards = async () => {
    const { data } = await supabase
      .from('wards')
      .select('id, name, pincode')
      .order('name');
    if (data) setWards(data);
  };

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select(`
        *,
        wards (name)
      `)
      .order('contact_type');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load emergency contacts',
        variant: 'destructive',
      });
    } else {
      setContacts(data as EmergencyContact[]);
    }
    setLoading(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesWard = !selectedWard || contact.ward_id === selectedWard;
    const matchesSearch = !searchQuery || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWard && matchesSearch;
  });

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return Building2;
      case 'pwd_engineer':
        return Wrench;
      default:
        return Phone;
    }
  };

  const getContactColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'bg-destructive/10 text-destructive';
      case 'pwd_engineer':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Emergency Contacts</h1>
          <p className="text-muted-foreground">
            Quick access to hospitals and PWD engineers in your area
          </p>
        </motion.div>

        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-destructive mb-2">
                In case of emergency
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                If you're in immediate danger due to flooding, call the emergency helpline immediately.
              </p>
              <Button
                variant="destructive"
                onClick={() => window.open('tel:112')}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Emergency: 112
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
            <Select
                value={selectedWard || "all"}
                onValueChange={(v) => setSelectedWard(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact, index) => {
            const Icon = getContactIcon(contact.contact_type);
            const colorClass = getContactColor(contact.contact_type);

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {contact.contact_type.replace('_', ' ')}
                    </span>
                    <h3 className="font-semibold mt-1 truncate">{contact.name}</h3>
                    {contact.wards?.name && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{contact.wards.name}</span>
                      </div>
                    )}
                    {contact.address && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {contact.address}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(`tel:${contact.phone}`)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {contact.phone}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No contacts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or ward filter
            </p>
          </div>
        )}

        {/* Important Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-bold mb-6">Important Helpline Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Police', number: '100', color: 'bg-primary/10 text-primary' },
              { name: 'Ambulance', number: '102', color: 'bg-destructive/10 text-destructive' },
              { name: 'Fire', number: '101', color: 'bg-warning/10 text-warning' },
            ].map((helpline) => (
              <button
                key={helpline.number}
                onClick={() => window.open(`tel:${helpline.number}`)}
                className={`p-6 rounded-xl ${helpline.color} hover:opacity-80 transition-opacity`}
              >
                <div className="text-3xl font-bold mb-1">{helpline.number}</div>
                <div className="font-medium">{helpline.name}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Emergency;
