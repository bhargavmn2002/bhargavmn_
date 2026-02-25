'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Monitor, Zap, Shield, Cloud, ArrowRight, Users, BarChart3, Calendar, Layout, PlayCircle, Settings, CheckCircle2 } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
    
    // Ensure page starts at top
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Monitor,
      title: 'Multi-Display Management',
      description: 'Control unlimited displays from a single dashboard. Monitor status, schedule content, and manage everything remotely in real-time.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Zap,
      title: 'Real-Time Content Updates',
      description: 'Push content updates instantly to all your displays. Changes reflect immediately without any delays or manual intervention.',
      color: 'from-orange-400 to-red-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with role-based access control, encrypted data transmission, and comprehensive audit logs.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Cloud,
      title: 'Cloud-Based Platform',
      description: 'Access your signage system from anywhere, anytime. No hardware installation, no maintenance, just pure convenience.',
      color: 'from-blue-400 to-blue-600'
    }
  ];

  const capabilities = [
    { icon: Layout, title: 'Layout Designer', desc: 'Create multi-zone layouts with drag-and-drop' },
    { icon: PlayCircle, title: 'Playlist Management', desc: 'Build dynamic playlists with scheduling' },
    { icon: Calendar, title: 'Smart Scheduling', desc: 'Time-based and date-based content control' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Proof of play and performance metrics' },
    { icon: Users, title: 'User Management', desc: 'Multi-level access with role permissions' },
    { icon: Settings, title: 'Remote Control', desc: 'Manage displays from anywhere' },
  ];

  const benefits = [
    'Reduce operational costs by up to 60%',
    'Update content across all locations instantly',
    'Increase customer engagement by 40%',
    'Save time with automated scheduling',
    'Scale effortlessly as your business grows',
    'Get 24/7 support from our expert team'
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* Left Side - SignoX Information (70%) */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-y-auto scrollbar-hide">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 w-full p-16 space-y-16">
          {/* Logo and Branding */}
          <div data-aos="fade-down">
            <div className="flex items-center gap-6 mb-8">
              <img 
                src="/signomart-full-logo.png" 
                alt="Signomart" 
                className="h-32 w-32 object-contain"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-0">
                  <span className="text-7xl font-black text-white tracking-tight">SIGNOX</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-32 bg-white"></div>
                  <p className="text-white font-bold text-2xl">Digital Signage Management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Description */}
          <div data-aos="fade-up" className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
            <h2 className="text-5xl font-black text-white mb-6">
              Transform Your Digital Signage Experience
            </h2>
            <p className="text-gray-200 text-xl leading-relaxed">
              SignoX is a comprehensive cloud-based digital signage management system that empowers businesses to create, manage, and display dynamic content across multiple screens with ease. Built for scalability, reliability, and performance.
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-6">
            <h3 data-aos="fade-right" className="text-4xl font-black text-white mb-8">Powerful Features</h3>
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  data-aos="fade-right"
                  data-aos-delay={i * 100}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-6">
                    <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capabilities Grid */}
          <div>
            <h3 data-aos="fade-right" className="text-4xl font-black text-white mb-8">Complete Solution</h3>
            <div className="grid grid-cols-3 gap-6">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={i}
                    data-aos="zoom-in"
                    data-aos-delay={i * 100}
                    className="bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-400/30 hover:scale-105 hover:border-yellow-400/50 transition-all duration-300"
                  >
                    <Icon className="h-10 w-10 text-yellow-400 mb-4" />
                    <h4 className="text-white font-bold text-lg mb-2">{cap.title}</h4>
                    <p className="text-gray-300 text-sm">{cap.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Features */}
          <div>
            <h3 data-aos="fade-right" className="text-4xl font-black text-white mb-8">Advanced Features</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: 'Multi-Zone Layouts', desc: 'Create complex layouts with multiple content zones and independent playlists' },
                { title: 'Device Pairing', desc: 'Secure 6-digit pairing code system for quick display setup' },
                { title: 'Heartbeat Monitoring', desc: 'Real-time display status tracking with automatic offline detection' },
                { title: 'Role-Based Access', desc: 'Super Admin, Client Admin, User Admin, and Staff role hierarchy' },
                { title: 'License Management', desc: 'Automated license expiry checking and enforcement system' },
                { title: 'Media Library', desc: 'Organized storage with tags, metadata, and search capabilities' },
                { title: 'Responsive Player', desc: 'Adaptive display player that works on any screen size or orientation' },
                { title: 'Schedule Override', desc: 'Priority-based scheduling with date and time range support' },
              ].map((feature, i) => (
                <div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={i * 50}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <h4 className="text-white font-bold text-xl mb-2">{feature.title}</h4>
                  <p className="text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (30%) */}
      <div className="w-full lg:w-[30%] lg:fixed lg:right-0 lg:top-0 lg:h-screen flex items-center justify-center p-8 relative">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-black/50 backdrop-blur-sm"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8" data-aos="fade-down">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img 
                src="/signomart-full-logo.png" 
                alt="Signomart" 
                className="h-20 w-20 object-contain"
              />
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-0">
                  <span className="text-4xl font-bold text-white">SIGNOX</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-16 bg-white"></div>
                  <span className="text-xs text-gray-300 italic">Digital Signage</span>
                </div>
              </div>
            </div>
          </div>

          <div data-aos="fade-left" className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl">
            {/* Logo in Card */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img 
                  src="/signomart-full-logo.png" 
                  alt="Signomart" 
                  className="h-16 w-16 object-contain"
                />
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-0">
                    <span className="text-5xl font-black text-white">SIGNOX</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 w-20 bg-white"></div>
                    <span className="text-xs text-gray-300 italic">Digital Signage</span>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl text-lg"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/20 p-4 text-sm text-red-200 border border-red-500/30">
                  <p className="font-semibold mb-1">Login Failed</p>
                  <p className="text-xs">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-6 w-6 animate-spin" />Signing in...</>
                ) : (
                  <>Sign In<ArrowRight className="ml-2 h-6 w-6" /></>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">© 2026 SignoX. All rights reserved.</p>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}
