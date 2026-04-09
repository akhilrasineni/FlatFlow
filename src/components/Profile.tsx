import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { User, Mail, Phone, Shield, Save, ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog.tsx';
import { deleteDoc } from 'firebase/firestore';

interface ProfileProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
  onBack: () => void;
  onDelete: () => void;
}

export function Profile({ profile, onUpdate, onBack, onDelete }: ProfileProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName,
        phone,
        email
      });
      
      const updatedProfile = {
        ...profile,
        displayName,
        phone,
        email
      };
      
      onUpdate(updatedProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await deleteDoc(userRef);
      toast.success("Profile deleted successfully.");
      onDelete();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Failed to delete profile. You may have active agreements.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2A5F]">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings.</p>
        </div>
      </div>

      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <div className="h-2 bg-brand-gradient w-full" />
        <CardHeader className="flex flex-row items-center gap-4 pb-6">
          <div className="h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-muted">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl text-[#0F2A5F]">{profile.displayName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Shield className="h-3 w-3" />
              <span className="capitalize">{profile.role} Account</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#0F2A5F] font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="name" 
                  className="pl-10 h-11" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0F2A5F] font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  className="pl-10 h-11" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#0F2A5F] font-semibold">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  className="pl-10 h-11" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0F2A5F] font-semibold">Account Role</Label>
              <div className="h-11 flex items-center px-4 bg-slate-50 border rounded-md text-slate-600 capitalize font-medium">
                {profile.role}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              variant="gradient" 
              className="h-12 px-8 rounded-xl font-bold gap-2"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-5 w-5" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Once you delete your profile, all your data will be permanently removed. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger 
              render={
                <Button variant="destructive" className="gap-2 rounded-xl">
                  <Trash2 className="h-4 w-4" />
                  Delete My Profile
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete your FlatFlow profile and remove your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => {}} className="rounded-lg">Cancel</Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteProfile} 
                  disabled={isDeleting}
                  className="rounded-lg"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Profile"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
