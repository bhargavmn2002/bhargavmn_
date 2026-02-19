'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Zap, TrendingUp, Shield, ArrowRight, Star, Award, Users, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-generate particle positions to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      width: (i * 7 % 6) + 2,
      height: (i * 5 % 6) + 2,
      top: (i * 13 % 100),
      left: (i * 17 % 100),
      duration: (i * 3 % 15) + 10,
      delay: (i * 2 % 5),
    }));
  }, []);

  // Multiple image galleries
  const signageGallery = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
    'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  ];

  const projectImages = [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
  ];

  const testimonials = [
    { name: 'Rajesh Kumar', company: 'Tech Solutions Pvt Ltd', text: 'Outstanding signage quality and service!' },
    { name: 'Priya Sharma', company: 'Retail Chain', text: 'Transformed our brand visibility completely.' },
    { name: 'Amit Patel', company: 'Corporate Office', text: 'Professional team, excellent results!' },
  ];

  const features = [
    { icon: Zap, title: 'Solving problems, building brands', color: 'from-yellow-400 to-orange-500' },
    { icon: TrendingUp, title: 'Building brands with purpose', color: 'from-orange-400 to-red-500' },
    { icon: Shield, title: 'Connecting customers to brands', color: 'from-yellow-500 to-yellow-600' },
  ];

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate main carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % signageGallery.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [signageGallery.length]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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

  return (
    <div ref={containerRef} className="flex min-h-screen overflow-hidden bg-black">
      {/* Left Side - Dynamic Showcase (70%) */}
      <div className="hidden lg:block lg:w-[70%] relative overflow-hidden">
        {/* Parallax Background Layers */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          }}
        >
          {/* Main Image Carousel with Ken Burns Effect */}
          {signageGallery.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-2000 ${
                index === currentSlide ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
              }`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                animation: index === currentSlide ? 'kenBurns 20s ease-out infinite' : 'none',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute bg-yellow-400 rounded-full opacity-20"
              style={{
                width: particle.width + 'px',
                height: particle.height + 'px',
                top: particle.top + '%',
                left: particle.left + '%',
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Content Container with Scroll */}
        <div className="relative z-10 h-full overflow-y-auto scrollbar-hide">
          <div className="min-h-full p-12 space-y-12">
            {/* Header with Logo */}
            <div className="animate-slide-down">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <img 
                    src="/signomart-logo.png" 
                    alt="Logo" 
                    className="h-24 w-24 bg-white p-4 rounded-3xl shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 animate-bounce">
                    <Star className="h-5 w-5 text-white fill-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-6xl font-black text-white tracking-tight">SignoMart</h1>
                  <p className="text-yellow-400 font-bold text-xl mt-2">We Sign Your Growth</p>
                </div>
              </div>

              {/* Animated Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: Building2, value: '500+', label: 'Projects' },
                  { icon: Users, value: '200+', label: 'Clients' },
                  { icon: Award, value: '15+', label: 'Years' },
                  { icon: Star, value: '100%', label: 'Satisfaction' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <Icon className="h-8 w-8 text-yellow-400 mb-2" />
                      <div className="text-3xl font-black text-white">{stat.value}</div>
                      <div className="text-sm text-gray-300">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Description Card */}
            <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/30 shadow-2xl animate-slide-up hover:scale-[1.02] transition-all duration-500">
              <h2 className="text-4xl font-black text-white mb-4">
                Digital Signage Management System
              </h2>
              <p className="text-gray-200 text-lg leading-relaxed mb-6">
                Signomart is one of the best signage manufacturers in Bangalore. ISO and OHSAS Certified with a track record of excellence and trust. From Outdoor 3D Sign Boards to LED or Neon Signs, we deliver innovative solutions that transform spaces.
              </p>
              <div className="flex items-center gap-3 text-yellow-400">
                <CheckCircle className="h-6 w-6" />
                <span className="font-bold text-lg">ISO & OHSAS Certified</span>
              </div>
            </div>

            {/* Animated Feature Cards */}
            <div className="space-y-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className={`bg-gradient-to-r ${feature.color} rounded-3xl p-6 shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500 cursor-pointer animate-slide-right group`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="bg-white/30 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-white">{feature.title}</h3>
                      </div>
                      <ArrowRight className="h-8 w-8 text-white group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project Gallery Grid */}
            <div className="grid grid-cols-2 gap-4">
              {projectImages.map((img, i) => (
                <div
                  key={i}
                  className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <img
                    src={img}
                    alt={`Project ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white font-bold">Project {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials Carousel */}
            <div className="relative h-40">
              {testimonials.map((testimonial, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-all duration-700 ${
                    i === currentTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <p className="text-white text-xl italic mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <div className="text-white font-bold">{testimonial.name}</div>
                        <div className="text-gray-300 text-sm">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2">
              {signageGallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-12 bg-yellow-400' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Fixed Login Card (30%) */}
      <div className="w-full lg:w-[30%] lg:fixed lg:right-0 lg:top-0 lg:h-screen flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <img src="/signomart-logo.png" alt="Logo" className="h-20 w-20 mx-auto bg-white p-3 rounded-xl shadow-lg mb-3" />
            <h1 className="text-3xl font-bold text-white">SignoMart</h1>
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-10 border border-white/10 shadow-2xl animate-scale-in">
            {/* Logo in Card */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-1 mb-4">
                <h1 className="text-5xl font-black text-white">SIGN</h1>
                <img 
                  src="/signomart-logo.png" 
                  alt="O" 
                  className="h-14 w-14 bg-white p-2 rounded-xl inline-block hover:rotate-12 transition-transform duration-300"
                />
                <h1 className="text-5xl font-black text-white">MART</h1>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400">Sign in to manage your digital signage</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@signox.com"
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
                <div className="rounded-xl bg-red-500/20 p-4 text-sm text-red-200 border border-red-500/30 animate-shake">
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

            <div className="mt-6 text-center">
              <div className="text-sm text-gray-400 bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="font-semibold text-gray-300 mb-2">Demo Credentials:</p>
                <p className="font-mono"></p>
                <p className="font-mono"></p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">© 2026 SignoMart. All rights reserved.</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
        .animate-slide-right { animation: slide-right 0.8s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
