import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Activity, TrendingUp, Shield, BarChart3, Smartphone, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white text-fill-current" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                Wattara
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob" />
          <div className="absolute top-40 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: Advanced Power Forecasting AI
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
            Monitor Energy. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Predict Savings.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            Take control of your electricity consumption with real-time monitoring and AI-powered forecasting. Smart insights for a greener, cheaper future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              Start Monitoring Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to save energy</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed to give you full visibility and forecast capabilities for your electrical devices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Activity}
              title="Real-time Monitoring"
              description="Track voltage, current, power factor, and energy consumption in real-time with millisecond precision."
              delay="0s"
            />
            <FeatureCard
              icon={TrendingUp}
              title="AI Forecasting"
              description="Predict future power usage using advanced machine learning algorithms to prevent peak load surcharges."
              delay="0.1s"
            />
            <FeatureCard
              icon={Smartphone}
              title="Device Management"
              description="Easily manage multiple devices across different locations from a single intuitive dashboard."
              delay="0.2s"
            />
            <FeatureCard
              icon={BarChart3}
              title="Detailed Analytics"
              description="Visualize historical trends with beautiful interactive charts and generate comprehensive PDF reports."
              delay="0.3s"
            />
            <FeatureCard
              icon={Shield}
              title="Smart Alerts"
              description="Get notified instantly when devices exceed power thresholds or exhibit abnormal behavior."
              delay="0.4s"
            />
            <FeatureCard
              icon={Zap}
              title="Cost Calculation"
              description="Automatic cost estimation based on your local electricity rates and usage patterns."
              delay="0.5s"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 bg-blue-600 rounded text-white sticky">
                  <Zap className="w-5 h-5 text-fill-current" />
                </div>
                <span className="text-xl font-bold text-white">
                  Wattara
                </span>
              </div>
              <p className="max-w-xs text-sm">
                Empowering homes and businesses to optimize energy usage through smart monitoring and AI forecasting.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Wattara Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay }) => {
  return (
    <div
      className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group opacity-0 animate-fade-in"
      style={{ animationDelay: delay, animationFillMode: 'forwards' }}
    >
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-blue-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default LandingPage;