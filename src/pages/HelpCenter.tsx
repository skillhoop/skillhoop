import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { 
  Rocket, 
  UserCog, 
  CreditCard, 
  Wrench, 
  FileText, 
  Shield,
  Search,
  Mail
} from 'lucide-react';

interface CategoryCard {
  title: string;
  icon: React.ReactNode;
  description: string;
  href: string;
}

const categories: CategoryCard[] = [
  {
    title: 'Getting Started',
    icon: <Rocket className="w-8 h-8" />,
    description: 'Learn the basics and get up and running quickly',
    href: '#'
  },
  {
    title: 'Account Management',
    icon: <UserCog className="w-8 h-8" />,
    description: 'Manage your profile, settings, and preferences',
    href: '#'
  },
  {
    title: 'Billing & Credits',
    icon: <CreditCard className="w-8 h-8" />,
    description: 'Understand pricing, credits, and subscription plans',
    href: '#'
  },
  {
    title: 'Technical Support',
    icon: <Wrench className="w-8 h-8" />,
    description: 'Troubleshooting and technical assistance',
    href: '#'
  },
  {
    title: 'Resume Guidelines',
    icon: <FileText className="w-8 h-8" />,
    description: 'Best practices for creating effective resumes',
    href: '#'
  },
  {
    title: 'Privacy',
    icon: <Shield className="w-8 h-8" />,
    description: 'Privacy policy, data security, and your rights',
    href: '#'
  }
];

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <LandingNavbar />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              How can we help you?
            </h1>
            
            {/* Search Input - Visual Only */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles, guides, and more..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-lg bg-white/90 backdrop-blur-sm"
                disabled
                aria-label="Search help center"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find the information you need quickly and easily
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.href}
                className="group bg-white rounded-xl border border-slate-200 p-8 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-lg text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-slate-50 border-t border-slate-200 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 border border-slate-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Our support team is ready to help you. Reach out and we'll get back to you as soon as possible.
              </p>
              <Link
                to="mailto:support@careerclarified.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

