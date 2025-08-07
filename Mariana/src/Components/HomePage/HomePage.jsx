import React, { useState } from 'react';
import {
  Users,
  MessageCircle,
  Calendar,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import RotatingText from '../RotatingText/RotatingText';

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-3 mb-3 text-blue-600">
      {icon}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const features = [
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "Ask Questions",
      description: "Get help from real people who’ve been there before."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Join Communities",
      description: "Find your people and feel seen in your interests."
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Chat with Others",
      description: "Build real connections, not just followers."
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Create Events",
      description: "Bring people together in real life or virtually."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitted(false);

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <RotatingText/>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're into climbing, coding, or coffee roasting — there's a space for you here.
          </p>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            aria-label="Get Started"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="bg-white py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Be the First to Join
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Sign up now for early access and get <strong>3 months free premium</strong> when we launch.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-3 w-full sm:w-auto rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Join Waitlist
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {submitted && (
            <p className="text-green-600 mt-2 font-medium">
              🎉 You're on the list! We'll keep you updated.
            </p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Join thousands of people connecting and sharing every day.
          </p>
          <button
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            aria-label="Sign Up Now"
          >
            <span className="flex items-center justify-center gap-2">
              Sign Up Now
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
