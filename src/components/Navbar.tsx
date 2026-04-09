import React from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button.tsx';
import { Home, Search, LayoutDashboard, LogIn, LogOut, User as UserIcon, Shield } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Navbar({ user, profile, onLogin, onLogout, onNavigate, currentView }: NavbarProps) {
  const logoUrl = "https://lh3.googleusercontent.com/d/1hh3GPMCO6Zcp1JrCsu9AI4cWyHK8BZ27";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('search')}>
            <img 
              src={logoUrl} 
              alt="FlatFlow Logo" 
              className="h-10 md:h-12 w-auto" 
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Button 
                  variant={currentView === 'search' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => onNavigate('search')}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>

                <Button 
                  variant={currentView === 'dashboard' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => onNavigate('dashboard')}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>

                {profile?.role === 'admin' && (
                  <Button 
                    variant={currentView === 'admin' ? 'destructive' : 'ghost'} 
                    size="sm" 
                    onClick={() => onNavigate('admin')}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div 
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onNavigate('profile')}
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile.displayName} className="h-8 w-8 rounded-full border" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium">{profile?.displayName || 'User'}</span>
                </div>
                <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 h-9 px-3 md:px-4">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} className="gap-2 h-10 px-6" variant="gradient">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex items-center justify-around h-16 px-4 pb-safe">
          <button 
            onClick={() => onNavigate('search')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${currentView === 'search' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>

          {profile?.role === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')}
              className={`flex flex-col items-center gap-1 flex-1 py-2 ${currentView === 'admin' ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              <Shield className="h-5 w-5" />
              <span className="text-[10px] font-medium">Admin</span>
            </button>
          )}

          <button 
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center gap-1 flex-1 py-2 ${currentView === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <UserIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      )}
    </>
  );
}
