import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { Check } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Basic resume builder',
        'Cover letter generator',
        'Job finder access',
        'Job tracker',
        'Limited AI features',
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-500 hover:bg-gray-600',
      isPopular: false,
    },
    {
      name: 'Job Seeker',
      price: '$19',
      description: 'For serious job seekers',
      features: [
        'Everything in Starter',
        'Unlimited AI content generation',
        'Advanced resume analytics',
        'Brand audit tools',
        'Content engine access',
        'Portfolio builder',
        'Priority support',
      ],
      buttonText: 'Upgrade Now',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-700',
      isPopular: true,
    },
    {
      name: 'Career Architect',
      price: '$39',
      description: 'Complete career management',
      features: [
        'Everything in Job Seeker',
        'Unlimited everything',
        'Advanced analytics',
        'Learning path builder',
        'Skill benchmarking',
        'Certification tracking',
        'Dedicated support',
        'Early access to features',
      ],
      buttonText: 'Upgrade Now',
      buttonStyle: 'bg-indigo-600 hover:bg-indigo-700',
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/50">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan to accelerate your career journey
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white/50 backdrop-blur-xl border rounded-2xl p-8 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  plan.isPopular
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-105'
                    : 'border-white/30'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== '$0' && (
                      <span className="text-gray-600 text-lg">/month</span>
                    )}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I change plans later?</h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards and PayPal. All payments are processed securely.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">
                  Yes! The Starter plan is free forever. Paid plans come with a 14-day free trial.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-600">
                  Absolutely. You can cancel your subscription at any time with no cancellation fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

