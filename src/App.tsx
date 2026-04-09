import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, signInWithGoogle, logout, OperationType, handleFirestoreError, loginWithEmail } from '@/lib/firebase';
import { UserProfile, Property, Role } from '@/types';
import { Navbar } from '@/components/Navbar';
import { PropertySearch } from '@/components/PropertySearch';
import { PropertyDetails } from '@/components/PropertyDetails';
import { TenantDashboard } from '@/components/TenantDashboard';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { Onboarding } from '@/components/Onboarding';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { Landing } from '@/components/Landing';
import { Profile } from '@/components/Profile';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [view, setView] = useState<'search' | 'details' | 'dashboard' | 'onboarding' | 'profile' | 'admin'>('search');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setProfile(profileData);
            if (profileData.role === 'admin') {
              setView('admin');
            }
          } else {
            // New user, default to tenant for now, they can choose in onboarding
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              role: 'tenant',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
            setView('onboarding');
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        // Check for mock user in session storage
        const mockUserStr = sessionStorage.getItem('mockUser');
        if (mockUserStr) {
          const mockData = JSON.parse(mockUserStr);
          setUser(mockData.user);
          setProfile(mockData.profile);
          if (mockData.profile.role === 'admin') {
            setView('admin');
          }
        } else {
          setUser(null);
          setProfile(null);
          setView('search'); // Reset view on logout
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailLogin = async (email: string, pass: string) => {
    const loginId = email.toLowerCase().trim();
    const dummyUsers: Record<string, { role: Role, name: string }> = {
      'admin': { role: 'admin', name: 'System Admin' },
      'owner': { role: 'owner', name: 'Property Owner' },
      'tenant': { role: 'tenant', name: 'Flat Tenant' }
    };

    if (dummyUsers[loginId] && pass === loginId) {
      const mockProfile: UserProfile = {
        uid: `mock_${loginId}`,
        email: `${loginId}@flatflow.demo`,
        displayName: dummyUsers[loginId].name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginId}`,
        role: dummyUsers[loginId].role,
        createdAt: new Date().toISOString(),
        phone: '9876543210'
      };
      
      const mockUser = {
        uid: mockProfile.uid,
        email: mockProfile.email,
        displayName: mockProfile.displayName,
        photoURL: mockProfile.photoURL,
      } as User;

      sessionStorage.setItem('mockUser', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      
      if (mockProfile.role === 'admin') {
        setView('admin');
      } else if (mockProfile.role === 'tenant' || mockProfile.role === 'owner') {
        setView('dashboard');
      } else {
        setView('search');
      }
      
      toast.success(`Logged in as ${dummyUsers[loginId].name} (Demo)`);
      return;
    }

    // Real Firebase Login
    try {
      setLoading(true);
      // Only try Firebase Auth if it looks like a real email
      if (email.includes('@')) {
        try {
          await loginWithEmail(email, pass);
          toast.success("Logged in successfully!");
          return;
        } catch (authError) {
          // Continue to fallback if auth fails
          console.log("Auth failed, trying fallback...");
        }
      }
      
      // Fallback for manual users created by admin
      try {
        const emailId = email.toLowerCase().trim();
        const passTrimmed = pass.trim();
        
        console.log(`Attempting fallback login for: ${emailId}`);
        let profileData: UserProfile | null = null;
        
        // 1. Try direct lookup by email ID (preferred)
        const userDoc = await getDoc(doc(db, 'users', emailId));
        
        if (userDoc.exists()) {
          profileData = userDoc.data() as UserProfile;
        } else {
          // 2. Try query fallback for users with random IDs (like "manual_1775...")
          console.log("Direct lookup failed, trying query fallback...");
          const q = query(collection(db, 'users'), where('email', '==', emailId), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            profileData = querySnapshot.docs[0].data() as UserProfile;
          }
        }
        
        if (profileData) {
          console.log("User profile found, checking password...");
          
          if (profileData.tempPassword === passTrimmed) {
            const mockUser = {
              uid: profileData.uid,
              email: profileData.email,
              displayName: profileData.displayName,
              photoURL: profileData.photoURL,
            } as User;
            
            sessionStorage.setItem('mockUser', JSON.stringify({ user: mockUser, profile: profileData }));
            setUser(mockUser);
            setProfile(profileData);
            
            if (profileData.role === 'admin') setView('admin');
            else if (profileData.role === 'tenant' || profileData.role === 'owner') setView('dashboard');
            else setView('search');
            
            toast.success(`Logged in as ${profileData.displayName}`);
            return;
          } else {
            console.log("Password mismatch");
            toast.error("Incorrect password. Please try again.");
            return;
          }
        } else {
          console.log("User document not found");
          toast.error("User profile not found. Please contact your administrator.");
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback login error:", fallbackError);
        toast.error("An error occurred during login. Please try again later.");
      }
      
      toast.error("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('mockUser');
    await logout();
    setUser(null);
    setProfile(null);
    setView('search');
    toast.success("Logged out successfully");
  };

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
          toast.error("Firebase connection error. Please check your configuration.");
        }
      }
    }
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14B8A6]"></div>
      </div>
    );
  }

  // ENFORCE LOGIN: If not logged in, show Landing page
  if (!user) {
    return (
      <ErrorBoundary>
        <Landing onLogin={signInWithGoogle} onEmailLogin={handleEmailLogin} />
        <Toaster />
      </ErrorBoundary>
    );
  }

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setView('details');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Navbar 
          user={user} 
          profile={profile} 
          onLogin={signInWithGoogle} 
          onLogout={handleLogout} 
          onNavigate={(v) => setView(v as any)}
          currentView={view}
        />
        
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {view === 'search' && (
            <PropertySearch onSelectProperty={handlePropertySelect} />
          )}
          
          {view === 'details' && selectedProperty && (
            <PropertyDetails 
              property={selectedProperty} 
              user={user} 
              profile={profile}
              onBack={() => setView('search')}
              onOnboarding={() => setView('onboarding')}
            />
          )}
          
          {view === 'dashboard' && profile && (
            profile.role === 'tenant' ? (
              <TenantDashboard profile={profile} />
            ) : (
              <OwnerDashboard profile={profile} />
            )
          )}

          {view === 'onboarding' && profile && (
            <Onboarding 
              profile={profile} 
              onComplete={(updatedProfile) => {
                setProfile(updatedProfile);
                setView('dashboard');
              }} 
            />
          )}

          {view === 'profile' && profile && (
            <Profile 
              profile={profile} 
              onUpdate={setProfile} 
              onBack={() => {
                if (profile.role === 'admin') setView('admin');
                else if (profile.role === 'tenant' || profile.role === 'owner') setView('dashboard');
                else setView('search');
              }}
              onDelete={handleLogout}
            />
          )}

          {view === 'admin' && profile?.role === 'admin' && (
            <AdminDashboard />
          )}
        </main>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
