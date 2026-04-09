import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Property, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  IndianRupee, 
  Bed, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface PropertyDetailsProps {
  property: Property;
  user: User | null;
  profile: UserProfile | null;
  onBack: () => void;
  onOnboarding: () => void;
}

export function PropertyDetails({ property, user, profile, onBack, onOnboarding }: PropertyDetailsProps) {
  const [scheduling, setScheduling] = useState(false);

  const handleScheduleVisit = async () => {
    if (!user) {
      toast.error("Please login to schedule a site visit.");
      return;
    }

    if (profile?.kycStatus !== 'verified') {
      toast.info("Please complete your KYC onboarding first.");
      onOnboarding();
      return;
    }

    setScheduling(true);
    try {
      await addDoc(collection(db, 'siteVisits'), {
        propertyId: property.id,
        tenantId: user.uid,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'scheduled'
      });
      toast.success("Site visit scheduled for tomorrow!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'siteVisits');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden border shadow-sm bg-muted">
              <img 
                src={property.images[0] || `https://picsum.photos/seed/${property.id}/1200/800`} 
                alt={property.title}
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {property.images.map((img, idx) => (
                  <div key={idx} className="h-20 w-32 shrink-0 rounded-lg overflow-hidden border bg-muted">
                    <img src={img} alt={`${property.title} ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 px-1">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#0F2A5F]">{property.title}</h1>
                <div className="flex items-center text-muted-foreground mt-1 gap-1 text-sm md:text-base">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-2">{property.address}, {property.area}, {property.city}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-base md:text-lg px-3 py-1 w-fit">
                {property.bedrooms} BHK
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y">
              <div className="space-y-1">
                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-wider">Monthly Rent</p>
                <p className="text-lg md:text-xl font-bold flex items-center gap-1 text-[#0F2A5F]">
                  <IndianRupee className="h-4 w-4" />
                  {property.rent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-wider">Maintenance</p>
                <p className="text-lg md:text-xl font-bold flex items-center gap-1 text-[#0F2A5F]">
                  <IndianRupee className="h-4 w-4" />
                  {property.maintenance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-wider">Bedrooms</p>
                <p className="text-lg md:text-xl font-bold flex items-center gap-1 text-[#0F2A5F]">
                  <Bed className="h-4 w-4" />
                  {property.bedrooms}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-wider">Deposit</p>
                <p className="text-lg md:text-xl font-bold flex items-center gap-1 text-[#0F2A5F]">
                  <IndianRupee className="h-4 w-4" />
                  {(property.rent * 2).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-[#0F2A5F]">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(amenity => (
                  <Badge key={amenity} variant="secondary" className="gap-1 px-3 py-1 text-xs md:text-sm">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
            <div className="h-2 bg-brand-gradient w-full" />
            <CardHeader>
              <CardTitle className="text-xl text-[#0F2A5F]">Interested in this flat?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="gradient"
                className="w-full h-14 text-lg font-bold rounded-xl" 
                onClick={handleScheduleVisit}
                disabled={scheduling}
              >
                {scheduling ? "Scheduling..." : "Schedule Site Visit"}
              </Button>
              <p className="text-xs text-center text-muted-foreground px-2">
                Scheduling a visit is free. You'll be able to see the property in person before making a decision.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{property.ownerName}</p>
                  <p className="text-sm text-muted-foreground">Verified Owner</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>
                  +91 {property.ownerPhone 
                    ? `${property.ownerPhone.slice(0, 2)}${'*'.repeat(Math.max(0, property.ownerPhone.length - 2))}` 
                    : '98**********'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <ShieldCheck className="h-4 w-4" />
                <span>Identity Verified</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
