import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { UserProfile, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, ShieldCheck, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingProps {
  profile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

export function Onboarding({ profile, onComplete }: OnboardingProps) {
  const [role, setRole] = useState<Role>(profile.role || 'tenant');
  const [phone, setPhone] = useState(profile.phone || '');
  const [loading, setLoading] = useState(false);

  const handleOnboarding = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = {
        ...profile,
        role,
        phone,
        kycStatus: 'verified' as const, // Auto-verify for demo
      };
      await updateDoc(doc(db, 'users', profile.uid), updatedProfile);
      toast.success("Onboarding complete! Welcome to FlatFlow.");
      onComplete(updatedProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete your profile</CardTitle>
          <CardDescription>We need a few more details to get you started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>I am a...</Label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setRole('tenant')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'tenant' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
              >
                <User className={`h-6 w-6 ${role === 'tenant' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium text-xs">Tenant</span>
              </button>
              <button 
                onClick={() => setRole('owner')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'owner' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
              >
                <Building className={`h-6 w-6 ${role === 'owner' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium text-xs">Owner</span>
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === 'admin' ? 'border-red-500 bg-red-50' : 'border-muted hover:border-primary/50'}`}
              >
                <Shield className={`h-6 w-6 ${role === 'admin' ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className="font-medium text-xs">Admin</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-[#0F2A5F] font-semibold">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-medium">+91</span>
              <Input 
                id="phone" 
                placeholder="98765 43210" 
                className="pl-12 h-11 rounded-lg border-slate-200"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <Button 
            variant="gradient"
            className="w-full h-12 text-lg font-bold rounded-xl gap-2" 
            onClick={handleOnboarding} 
            disabled={loading}
          >
            {loading ? "Saving..." : "Get Started"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
