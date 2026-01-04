import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="dots" patternUnits="userSpaceOnUse" width="10" height="10">
              <circle cx="5" cy="5" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Join the Movement for a<br />
            <span className="opacity-80">Flood-Free City</span>
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Whether you're a citizen or an authority, Ward Dost helps you contribute 
            to making our city safer during monsoons.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => navigate('/auth')}
            >
              <Users className="mr-2 h-5 w-5" />
              Join as Citizen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10"
              onClick={() => navigate('/auth')}
            >
              <Shield className="mr-2 h-5 w-5" />
              Join as Authority
            </Button>
          </div>

          <p className="mt-8 text-white/50 text-sm">
            Authentication required via OTP for verification
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
