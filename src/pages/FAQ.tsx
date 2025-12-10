import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import LandingFooter from '../components/landing/LandingFooter';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does the ATS optimization work?',
    answer: 'Our ATS (Applicant Tracking System) optimization uses advanced algorithms to analyze your resume and ensure it\'s compatible with the most common ATS software used by employers. We optimize keyword placement, formatting, and structure to maximize your resume\'s chances of passing through automated screening systems. Our AI scans for industry-specific keywords, ensures proper section headers, removes formatting that could confuse ATS systems, and suggests improvements based on job descriptions you\'re targeting. This increases your resume\'s visibility and helps you get past the initial screening phase.'
  },
  {
    question: 'Is my personal data safe?',
    answer: 'Absolutely. We take data security and privacy very seriously. All your personal information, including resumes, cover letters, and job search data, is encrypted both in transit and at rest using industry-standard encryption protocols. We comply with GDPR, CCPA, and other major data protection regulations. Your data is stored securely in our database and is never shared with third parties without your explicit consent. We use secure authentication methods and regularly audit our security practices. You can read more about our security measures in our Privacy Policy.'
  },
  {
    question: 'How does the credit system work?',
    answer: 'SkillHoop uses a credit-based system to manage AI-powered features. Free plans receive a monthly allocation of credits that refresh each billing cycle. Premium plans include more generous credit allowances. Credits are consumed when you use AI features like resume optimization, cover letter generation, job matching, and interview preparation. Each action has a specific credit cost - for example, generating a cover letter might cost 5 credits, while a full resume analysis might cost 10 credits. Unused credits roll over to the next month (up to a certain limit), and you can purchase additional credit packs if needed. This system ensures fair usage while keeping our services affordable.'
  },
  {
    question: 'Can I download resumes as PDF?',
    answer: 'Yes! You can download your resumes in multiple formats, including PDF, Word (.docx), and plain text. The PDF format is optimized for both ATS systems and human reviewers, maintaining professional formatting and ensuring compatibility. Simply navigate to your Resume Studio, select the resume you want to download, and choose your preferred format from the export options. PDF downloads are available on all plans and maintain all formatting, fonts, and styling from your resume template.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel your subscription at any time with no cancellation fees. When you cancel, you\'ll continue to have access to all premium features until the end of your current billing period. After that, your account will revert to the free plan, and you\'ll retain access to your saved resumes, cover letters, and job search history. We don\'t offer refunds for partial billing periods, but you won\'t be charged for future billing cycles after cancellation. To cancel, simply go to your account settings and click "Cancel Subscription." We\'re sorry to see you go, but we make the process as straightforward as possible.'
  },
  {
    question: 'How accurate is the AI job matching?',
    answer: 'Our AI job matching uses machine learning algorithms trained on millions of job postings and successful applications. The system analyzes your skills, experience, preferences, and career goals to match you with relevant opportunities. The matching accuracy improves over time as the AI learns from your interactions, saved jobs, and application outcomes. We use a combination of semantic matching (understanding job meaning, not just keywords), skill alignment, location preferences, and salary expectations to provide you with the most relevant matches. While we can\'t guarantee job offers, our matching system significantly increases your chances of finding positions that align with your qualifications.'
  },
  {
    question: 'Can I use SkillHoop for multiple career paths?',
    answer: 'Yes! SkillHoop supports multiple career profiles and paths. You can create separate resume versions for different industries or roles, each with its own tailored content and formatting. Our platform allows you to switch between profiles, track applications for different career paths, and maintain separate work histories. This is especially useful if you\'re exploring career transitions, have a side business, or want to apply for both full-time and freelance positions. Each profile maintains its own set of resumes, cover letters, and job search preferences.'
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We offer comprehensive support through multiple channels. Free plan users have access to our knowledge base, FAQ section, and email support with a 48-hour response time. Premium subscribers receive priority email support (24-hour response), live chat during business hours, and access to our community forum. Career Architect plan members get dedicated support with faster response times and can schedule one-on-one consultations with our career experts. We also regularly host webinars, provide video tutorials, and maintain an extensive help center with step-by-step guides for all features.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find answers to common questions about SkillHoop. Can't find what you're looking for? 
              Check out our support resources or reach out through your account dashboard.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset transition-colors hover:bg-slate-50"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help Section */}
          <div className="mt-12 p-6 bg-indigo-50 rounded-lg border border-indigo-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-slate-600 mb-4">
              Our support team is here to help. Access support through your account dashboard or check out our pricing plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

