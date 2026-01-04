import { motion } from 'framer-motion';
import { 
  MapPin, 
  Camera, 
  Bell, 
  Phone, 
  BarChart3, 
  Users,
  Shield,
  Droplets
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Ward Selection',
    description: 'Select your ward or enter pincode to check water logging risk levels and drainage status.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Camera,
    title: 'Photo Reports',
    description: 'Upload images of blocked drains and water-logged areas for quick action by authorities.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: BarChart3,
    title: 'Risk Analysis',
    description: 'AI-powered analysis showing high-risk areas based on rainfall vs drain capacity.',
    color: 'bg-destructive/10 text-destructive',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description: 'Get notifications about water logging situations in your area during monsoon.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Phone,
    title: 'Emergency Contacts',
    description: 'Quick access to nearest hospitals and PWD engineers for immediate assistance.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Users,
    title: 'Community Reviews',
    description: 'Rate and review reported issues to identify authentic problems and track resolutions.',
    color: 'bg-primary/10 text-primary',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Droplets className="h-4 w-4" />
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="text-gradient">Stay Safe</span>
          </h2>
          <p className="text-muted-foreground">
            Ward Dost provides comprehensive tools for citizens and authorities to manage 
            water logging situations effectively.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-card rounded-3xl p-8 md:p-12 border shadow-lg"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Understanding Water Logging
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple calculation for easy understanding during monsoon
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-center gap-4 p-6 bg-destructive/10 rounded-2xl">
              <div className="flex-shrink-0 w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
                <Droplets className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Water Logging Risk</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-1 rounded">Rainwater {'>'} Drain Capacity</span>
                  <br />
                  → High risk of flooding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-success/10 rounded-2xl">
              <div className="flex-shrink-0 w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Safe Condition</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-1 rounded">Rainwater {'<'} Drain Capacity</span>
                  <br />
                  → No flooding expected
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
