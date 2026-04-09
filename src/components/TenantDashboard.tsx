import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { UserProfile, Agreement, Payment, SiteVisit, Property } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  IndianRupee,
  Calendar,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { AgreementDocument } from './AgreementDocument';

interface TenantDashboardProps {
  profile: UserProfile;
}

export function TenantDashboard({ profile }: TenantDashboardProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [otherPartyProfile, setOtherPartyProfile] = useState<UserProfile | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const qAgreements = query(collection(db, 'agreements'), where('tenantId', '==', profile.uid));
    const qPayments = query(collection(db, 'payments'), where('tenantId', '==', profile.uid));
    const qVisits = query(collection(db, 'siteVisits'), where('tenantId', '==', profile.uid));

    const unsubAgreements = onSnapshot(qAgreements, (snapshot) => {
      setAgreements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Agreement)));
    });

    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
    });

    const unsubVisits = onSnapshot(qVisits, (snapshot) => {
      setVisits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SiteVisit)));
    });

    const unsubProperties = onSnapshot(collection(db, 'properties'), (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property)));
      setLoading(false);
    });

    return () => {
      unsubAgreements();
      unsubPayments();
      unsubVisits();
      unsubProperties();
    };
  }, [profile.uid]);

  const handlePayRent = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      toast.success("Payment successful!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${paymentId}`);
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    try {
      await updateDoc(doc(db, 'siteVisits', visitId), {
        status: 'completed'
      });
      toast.success("Visit marked as completed!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `siteVisits/${visitId}`);
    }
  };

  const handleExpressInterest = async (visitId: string, interested: boolean) => {
    try {
      await updateDoc(doc(db, 'siteVisits', visitId), {
        tenantInterested: interested,
        tenantName: profile.displayName
      });
      if (interested) {
        toast.success("Interest expressed! The owner will be notified to draft an agreement.");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `siteVisits/${visitId}`);
    }
  };

  const handleSignAgreement = async (agreementId: string) => {
    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) return;

      const isFullySigned = agreement.ownerSigned;
      await updateDoc(doc(db, 'agreements', agreementId), {
        tenantSigned: true,
        status: isFullySigned ? 'active' : 'pending'
      });
      toast.success("Agreement signed successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `agreements/${agreementId}`);
    }
  };

  const handleExitRequest = async (agreementId: string) => {
    try {
      const vacateDate = new Date(Date.now() + 60 * 86400000); // 60 days notice (2 months)
      await updateDoc(doc(db, 'agreements', agreementId), {
        exitRequested: true,
        exitDate: new Date().toISOString(),
        vacateDate: vacateDate.toISOString()
      });
      toast.success("Exit request raised. 2-month notice period started.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `agreements/${agreementId}`);
    }
  };

  const activeAgreement = agreements.find(a => a.status === 'active');
  const pendingAgreements = agreements.filter(a => a.status === 'pending');

  const handleViewAgreement = async (agreement: Agreement) => {
    setSelectedAgreement(agreement);
    try {
      const ownerDoc = await getDoc(doc(db, 'users', agreement.ownerId));
      if (ownerDoc.exists()) {
        setOtherPartyProfile(ownerDoc.data() as UserProfile);
      } else {
        // Fallback to query if doc ID is not UID
        const q = query(collection(db, 'users'), where('uid', '==', agreement.ownerId));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          setOtherPartyProfile(querySnap.docs[0].data() as UserProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.displayName}</h1>
        <p className="text-muted-foreground">Manage your rentals, payments, and site visits.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-white border-primary/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-brand-gradient w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Active Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold flex items-center gap-1 text-[#0F2A5F]">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
              {activeAgreement ? activeAgreement.rent.toLocaleString('en-IN') : '0'}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Due on 5th of every month</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Upcoming Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold flex items-center gap-1 text-[#14B8A6]">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
              {payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{payments.filter(p => p.status === 'pending').length} pending payments</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-semibold text-[#0F2A5F] uppercase tracking-wider">Site Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#0F2A5F]">{visits.filter(v => v.status === 'scheduled').length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Scheduled for this week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="payments" className="rounded-lg py-2 px-4">Payments</TabsTrigger>
          <TabsTrigger value="agreement" className="rounded-lg py-2 px-4">
            Agreement {pendingAgreements.length > 0 && <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-[8px]">{pendingAgreements.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="visits" className="rounded-lg py-2 px-4">Visits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your rent and maintenance payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length > 0 ? (
                  payments.map(payment => (
                    <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full shrink-0 ${payment.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {payment.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{payment.type} Payment</p>
                          <p className="text-sm text-muted-foreground">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="font-bold flex items-center sm:justify-end gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {payment.amount.toLocaleString('en-IN')}
                          </p>
                          <Badge variant={payment.status === 'paid' ? 'default' : 'outline'}>
                            {payment.status}
                          </Badge>
                        </div>
                        {payment.status === 'pending' && (
                          <Button variant="gradient" size="sm" className="rounded-lg px-4" onClick={() => handlePayRent(payment.id)}>Pay Now</Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No payment records found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreement" className="mt-6">
          {selectedAgreement ? (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAgreement(null)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Agreements
              </Button>
              <AgreementDocument 
                agreement={selectedAgreement}
                property={properties.find(p => p.id === selectedAgreement.propertyId) || { id: selectedAgreement.propertyId, title: 'Property', address: 'Address', city: 'City', area: 'Area', rent: selectedAgreement.rent, maintenance: 0, bedrooms: 2, amenities: [], images: [], ownerId: selectedAgreement.ownerId, ownerName: 'Owner', location: { lat: 0, lng: 0 } } as any}
                tenantProfile={profile}
                ownerProfile={otherPartyProfile || undefined}
                canSign={selectedAgreement.status === 'pending' && !selectedAgreement.tenantSigned}
                isSigning={signing}
                onSign={() => handleSignAgreement(selectedAgreement.id)}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Rental Agreements</CardTitle>
                <CardDescription>View and manage your digital rental agreements.</CardDescription>
              </CardHeader>
              <CardContent>
                {activeAgreement || pendingAgreements.length > 0 ? (
                  <div className="space-y-6">
                    {pendingAgreements.map(agreement => (
                      <div key={agreement.id} className="p-4 border-2 border-primary/20 bg-primary/5 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#0F2A5F]">Pending Agreement</h4>
                          <Badge variant="secondary">Action Required</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Rent</p>
                            <p className="font-medium">₹{agreement.rent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deposit</p>
                            <p className="font-medium">₹{agreement.deposit.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button variant="gradient" className="w-full" onClick={() => handleViewAgreement(agreement)}>
                          Review & Sign Agreement
                        </Button>
                      </div>
                    ))}

                    {activeAgreement && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Active Agreement</p>
                              <p className="text-sm text-muted-foreground">Started: {new Date(activeAgreement.startDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleViewAgreement(activeAgreement)}>View Document</Button>
                        </div>

                        <div className="pt-6 border-t">
                          {activeAgreement.exitRequested ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                <div>
                                  <p className="font-medium text-orange-900">Exit Request Active</p>
                                  <p className="text-sm text-orange-700">Vacate by: {new Date(activeAgreement.vacateDate!).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white text-orange-700 border-orange-200">2-Month Notice</Badge>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-4">
                              <h4 className="font-semibold">Planning to move out?</h4>
                              <p className="text-sm text-muted-foreground">You can raise an exit request here. A 2-month notice period will apply as per the agreement.</p>
                              <Button variant="destructive" className="w-fit gap-2" onClick={() => handleExitRequest(activeAgreement.id)}>
                                <LogOut className="h-4 w-4" />
                                Mark Vacate
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No active agreement</h3>
                    <p className="text-muted-foreground">Once you finalize a property, your agreement will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="visits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Visits</CardTitle>
              <CardDescription>Manage your upcoming property site visits.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visits.length > 0 ? (
                  visits.map(visit => (
                    <div key={visit.id} className="flex flex-col p-4 border rounded-xl gap-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Property Visit</p>
                            <p className="text-sm text-muted-foreground">{new Date(visit.scheduledAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <Badge variant={visit.status === 'scheduled' ? 'default' : 'secondary'}>
                          {visit.status}
                        </Badge>
                      </div>
                      
                      {visit.status === 'scheduled' && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => handleCompleteVisit(visit.id)}>
                          Mark as Completed
                        </Button>
                      )}

                      {visit.status === 'completed' && visit.tenantInterested === undefined && (
                        <div className="pt-2 border-t space-y-3">
                          <p className="text-sm font-medium text-center">Are you interested in renting this property?</p>
                          <div className="flex gap-2">
                            <Button variant="gradient" size="sm" className="flex-1" onClick={() => handleExpressInterest(visit.id, true)}>
                              Yes, I'm Interested
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExpressInterest(visit.id, false)}>
                              No, Thanks
                            </Button>
                          </div>
                        </div>
                      )}

                      {visit.tenantInterested === true && (
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-xs font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Interest expressed. Owner will draft agreement soon.
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2 text-blue-700 text-[10px] leading-relaxed">
                            <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            <p>Once the owner approves, your agreement will appear in the <strong>Agreement</strong> tab for you to sign.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No scheduled visits.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
