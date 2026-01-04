import { Droplets, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-sidebar-primary" />
              <span className="text-xl font-bold">Ward Dost</span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              Your trusted companion for navigating water-logged areas and reporting drainage issues in your city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-sidebar-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="hover:text-sidebar-primary transition-colors">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-sidebar-primary transition-colors">
                  Emergency Contacts
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li>How It Works</li>
              <li>Safety Guidelines</li>
              <li>PWD Information</li>
              <li>Weather Updates</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-sidebar-primary" />
                <span>1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sidebar-primary" />
                <span>help@warddost.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sidebar-primary" />
                <span>Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-8 pt-8 text-center text-sm text-sidebar-foreground/50">
          <p>© {new Date().getFullYear()} Ward Dost. All rights reserved.</p>
          <p className="mt-2">An initiative to make cities flood-free</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
