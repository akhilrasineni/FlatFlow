import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Home, Shield, UserCheck, Mail, Lock, Chrome } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LandingProps {
  onLogin: () => void;
  onEmailLogin: (email: string, pass: string) => void;
}

export function Landing({ onLogin, onEmailLogin }: LandingProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const logoUrl = "https://lh3.googleusercontent.com/d/1hh3GPMCO6Zcp1JrCsu9AI4cWyHK8BZ27";

  const handleCardClick = () => {
    setShowLoginForm(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 space-y-8 md:space-y-12 py-10 md:py-20">
      <div className="max-w-4xl w-full text-center space-y-8 md:space-y-12">
        <div className="flex flex-col items-center gap-2 md:gap-4">
          <img 
            src={logoUrl} 
            alt="FlatFlow Logo" 
            className="h-24 md:h-40 w-auto mb-2 md:mb-4" 
            referrerPolicy="no-referrer"
          />
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            The complete rental property platform for tenants, owners, and administrators. 
            Manage your rental lifecycle with ease and transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-left px-2 md:px-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-all border-primary/5 hover:border-primary/20 group"
            onClick={handleCardClick}
          >
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#0F2A5F]">For Tenants</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                Search verified flats, schedule visits, sign digital agreements, and pay rent online.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-all border-primary/5 hover:border-primary/20 group"
            onClick={handleCardClick}
          >
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-teal-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#0F2A5F]">For Owners</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                List properties, manage tenants, track revenue, and automate rental agreements.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-all border-primary/5 hover:border-primary/20 group"
            onClick={handleCardClick}
          >
            <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#0F2A5F]">For Admins</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                Full visibility into platform data, issue resolution, and system-wide management.
              </p>
            </CardContent>
          </Card>
        </div>

        {!showLoginForm ? (
          <div className="pt-4 md:pt-8">
            <Button 
              variant="gradient" 
              size="lg" 
              className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform"
              onClick={() => setShowLoginForm(true)}
            >
              <LogIn className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Get Started
            </Button>
          </div>
        ) : (
          <div className="max-w-md w-full mx-auto bg-white p-6 md:p-8 rounded-3xl border shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-1 md:space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-[#0F2A5F]">Welcome to FlatFlow</h2>
              <p className="text-xs md:text-sm text-muted-foreground">Login to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="text" 
                    placeholder="admin / owner / tenant" 
                    className="pl-10 h-11 rounded-xl text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs md:text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 rounded-xl text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11 rounded-xl font-bold text-sm">
                Login with Password
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] md:text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl gap-2 border-slate-200 text-sm"
              onClick={onLogin}
            >
              <Chrome className="h-4 w-4" />
              Google Sign-In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
