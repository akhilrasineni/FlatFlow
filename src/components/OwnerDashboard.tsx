import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { UserProfile, Property, Agreement, SiteVisit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { AgreementDocument } from './AgreementDocument';
import { 
  Plus, 
  Building, 
  Users, 
  FileCheck, 
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Home,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';

interface OwnerDashboardProps {
  profile: UserProfile;
}

export function OwnerDashboard({ profile }: OwnerDashboardProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '',
    address: '',
    city: '',
    area: '',
    rent: '',
    maintenance: '',
    bedrooms: '2',
    amenities: '',
    imageUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [otherPartyProfile, setOtherPartyProfile] = useState<UserProfile | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const qProperties = query(collection(db, 'properties'), where('ownerId', '==', profile.uid));
    const qAgreements = query(collection(db, 'agreements'), where('ownerId', '==', profile.uid));
    const qVisits = query(collection(db, 'siteVisits')); // In a real app, filter by properties owned by this owner

    const unsubProperties = onSnapshot(qProperties, (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
    });

    const unsubAgreements = onSnapshot(qAgreements, (snapshot) => {
      setAgreements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agreement)));
    });

    const unsubVisits = onSnapshot(qVisits, (snapshot) => {
      // Filter visits for properties owned by this owner
      const propertyIds = properties.map(p => p.id);
      setVisits(snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit))
        .filter(v => propertyIds.includes(v.propertyId))
      );
      setLoading(false);
    });

    return () => {
      unsubProperties();
      unsubAgreements();
      unsubVisits();
    };
  }, [profile.uid, properties.length]);

  const handleApproveVisit = async (visitId: string) => {
    try {
      await updateDoc(doc(db, 'siteVisits', visitId), { status: 'completed' });
      toast.success("Visit marked as completed.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `siteVisits/${visitId}`);
    }
  };

  const handleCreateAgreement = async (visit: SiteVisit) => {
    const property = properties.find(p => p.id === visit.propertyId);
    if (!property) return;

    try {
      const agreementData: Omit<Agreement, 'id'> = {
        propertyId: property.id,
        tenantId: visit.tenantId,
        tenantName: visit.tenantName || 'Tenant',
        ownerId: profile.uid,
        ownerName: profile.displayName,
        rent: property.rent,
        deposit: property.rent * 2,
        startDate: new Date().toISOString().split('T')[0],
        durationMonths: 11,
        status: 'pending',
        tenantSigned: false,
        ownerSigned: false
      };
      
      const docRef = await addDoc(collection(db, 'agreements'), agreementData);
      
      // Mark property as occupied
      await updateDoc(doc(db, 'properties', property.id), { isOccupied: true });
      
      // Create initial rent payment
      await addDoc(collection(db, 'payments'), {
        agreementId: docRef.id,
        tenantId: visit.tenantId,
        amount: property.rent,
        type: 'rent',
        status: 'pending',
        dueDate: new Date().toISOString().split('T')[0]
      });

      toast.success("Rental agreement generated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'agreements');
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.title || !newProperty.address || !newProperty.rent) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const images = newProperty.imageUrl 
        ? newProperty.imageUrl.split(',').map(s => s.trim()).filter(s => s)
        : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800'];

      const propertyData: Omit<Property, 'id'> = {
        title: newProperty.title,
        address: newProperty.address,
        city: newProperty.city || 'Bangalore',
        area: newProperty.area || 'HSR Layout',
        rent: Number(newProperty.rent),
        maintenance: Number(newProperty.maintenance) || 0,
        bedrooms: Number(newProperty.bedrooms),
        amenities: newProperty.amenities.split(',').map(s => s.trim()).filter(s => s),
        images: images,
        ownerId: profile.uid,
        ownerName: profile.displayName,
        ownerPhone: profile.phone,
        location: {
          lat: 12.9716, // Default Bangalore coords
          lng: 77.5946
        }
      };

      await addDoc(collection(db, 'properties'), propertyData);
      toast.success("Property listed successfully!");
      setIsAddModalOpen(false);
      setNewProperty({
        title: '',
        address: '',
        city: '',
        area: '',
        rent: '',
        maintenance: '',
        bedrooms: '2',
        amenities: '',
        imageUrl: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'properties');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignAgreement = async (agreementId: string) => {
    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) return;

      const isFullySigned = agreement.tenantSigned;
      await updateDoc(doc(db, 'agreements', agreementId), { 
        ownerSigned: true,
        status: isFullySigned ? 'active' : 'pending'
      });
      toast.success("Agreement signed successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `agreements/${agreementId}`);
    }
  };

  const handleVacateProperty = async (agreementId: string, propertyId: string) => {
    try {
      await updateDoc(doc(db, 'agreements', agreementId), { status: 'terminated' });
      await updateDoc(doc(db, 'properties', propertyId), { isOccupied: false });
      toast.success("Property marked as vacant and available for rent!");
    } catch (error) {
      console.error("Error vacating property:", error);
      toast.error("Failed to update property status");
    }
  };

  const handleViewAgreement = async (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    try {
      const tenantDoc = await getDoc(doc(db, 'users', agreement.tenantId));
      if (tenantDoc.exists()) {
        setOtherPartyProfile(tenantDoc.data() as UserProfile);
      } else {
        // Fallback to query if doc ID is not UID
        const q = query(collection(db, 'users'), where('uid', '==', agreement.tenantId));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setOtherPartyProfile(querySnap.docs[0].data() as UserProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching tenant profile:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2A5F]">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your properties and tenants.</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger render={
            <Button variant="gradient" className="gap-2 h-11 px-6 rounded-xl font-bold">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>List New Property</DialogTitle>
              <DialogDescription>
                Enter the details of your property to list it for potential tenants.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProperty} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Modern 2BHK in HSR Layout" 
                  value={newProperty.title}
                  onChange={e => setNewProperty({...newProperty, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                  <Input 
                    id="rent" 
                    type="number"
                    placeholder="25000" 
                    value={newProperty.rent}
                    onChange={e => setNewProperty({...newProperty, rent: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenance">Maintenance (₹)</Label>
                  <Input 
                    id="maintenance" 
                    type="number"
                    placeholder="3000" 
                    value={newProperty.maintenance}
                    onChange={e => setNewProperty({...newProperty, maintenance: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input 
                  id="address" 
                  placeholder="House No, Street, Landmark" 
                  value={newProperty.address}
                  onChange={e => setNewProperty({...newProperty, address: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area/Locality</Label>
                  <Input 
                    id="area" 
                    placeholder="e.g. Sector 2, HSR" 
                    value={newProperty.area}
                    onChange={e => setNewProperty({...newProperty, area: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                  <Select 
                    value={newProperty.bedrooms} 
                    onValueChange={v => setNewProperty({...newProperty, bedrooms: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select BHK" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 BHK</SelectItem>
                      <SelectItem value="2">2 BHK</SelectItem>
                      <SelectItem value="3">3 BHK</SelectItem>
                      <SelectItem value="4">4+ BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amenities">Amenities (comma separated)</Label>
                <Input 
                  id="amenities" 
                  placeholder="WiFi, Parking, Gym, Lift" 
                  value={newProperty.amenities}
                  onChange={e => setNewProperty({...newProperty, amenities: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URLs (comma separated)</Label>
                <Input 
                  id="imageUrl" 
                  placeholder="https://image1.jpg, https://image2.jpg" 
                  value={newProperty.imageUrl}
                  onChange={e => setNewProperty({...newProperty, imageUrl: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? 'Listing...' : 'List Property'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-white border-primary/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-brand-gradient w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F2A5F]">{properties.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Active listings</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#14B8A6]">{agreements.filter(a => a.status === 'active').length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Current residents</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold flex items-center gap-1 text-[#0F2A5F]">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
              {agreements.filter(a => a.status === 'active').reduce((acc, a) => acc + a.rent, 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Projected income</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="visits" className="rounded-lg py-2 px-4">Site Visits</TabsTrigger>
          <TabsTrigger value="properties" className="rounded-lg py-2 px-4">Properties</TabsTrigger>
          <TabsTrigger value="tenants" className="rounded-lg py-2 px-4">Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Visits & Onboarding</CardTitle>
              <CardDescription>Approve visits and onboard new tenants.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visits.length > 0 ? (
                  visits.map(visit => (
                    <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Visit from Tenant ID: {visit.tenantId.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">Scheduled: {new Date(visit.scheduledAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {visit.tenantInterested && (
                          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">
                            Tenant Interested
                          </Badge>
                        )}
                        <div className="flex items-center gap-2">
                          {visit.status === 'scheduled' ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleApproveVisit(visit.id)}>Mark Completed</Button>
                              <Button variant="gradient" size="sm" className="gap-2 rounded-lg" onClick={() => handleCreateAgreement(visit)}>
                                <FileCheck className="h-4 w-4" />
                                Onboard
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">Completed</Badge>
                              {visit.tenantInterested && !agreements.some(a => a.tenantId === visit.tenantId && a.propertyId === visit.propertyId) && (
                                <Button variant="gradient" size="sm" className="gap-2 rounded-lg" onClick={() => handleCreateAgreement(visit)}>
                                  <FileCheck className="h-4 w-4" />
                                  Onboard Tenant
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No visit requests found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Properties</CardTitle>
              <CardDescription>Manage your property listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {properties.map(property => (
                  <div key={property.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img src={property.images[0]} className="w-16 h-16 rounded object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-medium line-clamp-1">{property.title}</p>
                      <p className="text-sm text-muted-foreground">₹{property.rent.toLocaleString('en-IN')} / mo</p>
                      <Badge variant="outline" className="mt-1">{property.bedrooms} BHK</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="mt-6">
          {selectedAgreement ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAgreement(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tenants
              </Button>
              <AgreementDocument 
                agreement={selectedAgreement}
                property={properties.find(p => p.id === selectedAgreement.propertyId) || { id: selectedAgreement.propertyId, title: 'Property', address: 'Address', city: 'City', area: 'Area', rent: selectedAgreement.rent, maintenance: 0, bedrooms: 2, amenities: [], images: [], ownerId: selectedAgreement.ownerId, ownerName: 'Owner', location: { lat: 0, lng: 0 } } as any}
                ownerProfile={profile}
                tenantProfile={otherPartyProfile || undefined}
                canSign={selectedAgreement.status === 'pending' && !selectedAgreement.ownerSigned}
                isSigning={signing}
                onSign={() => handleSignAgreement(selectedAgreement.id)}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Active Tenants & Agreements</CardTitle>
                <CardDescription>View current rental agreements and status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agreements.length > 0 ? (
                    agreements.map(agreement => (
                      <div key={agreement.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full shrink-0 ${agreement.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {agreement.status === 'active' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="font-medium">Tenant ID: {agreement.tenantId.slice(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">Started: {new Date(agreement.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="text-left sm:text-right">
                            <p className="font-bold">₹{agreement.rent.toLocaleString('en-IN')}</p>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={agreement.exitRequested ? 'destructive' : agreement.status === 'active' ? 'default' : 'secondary'}>
                                {agreement.exitRequested ? 'Exit Requested' : agreement.status}
                              </Badge>
                              {agreement.exitRequested && (
                                <p className="text-[10px] text-destructive font-medium">
                                  Vacating on: {new Date(agreement.vacateDate || '').toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewAgreement(agreement)}>
                              {agreement.status === 'pending' ? 'Review & Sign' : 'View Document'}
                            </Button>
                            {agreement.status === 'active' && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 text-[10px]"
                                onClick={() => handleVacateProperty(agreement.id, agreement.propertyId)}
                              >
                                Mark Vacated
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No active tenants found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
