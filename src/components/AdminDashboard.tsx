import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Property, SiteVisit, Agreement, Payment, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Home, Calendar, FileText, CreditCard, Search, UserPlus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // New User Form State
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    phone: '',
    tempPassword: '',
    role: 'tenant' as Role
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnap, propsSnap, visitsSnap, agreementsSnap, paymentsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'properties')),
        getDocs(collection(db, 'siteVisits')),
        getDocs(collection(db, 'agreements')),
        getDocs(collection(db, 'payments'))
      ]);

      setUsers(usersSnap.docs.map(doc => doc.data() as UserProfile));
      setProperties(propsSnap.docs.map(doc => doc.data() as Property));
      setVisits(visitsSnap.docs.map(doc => doc.data() as SiteVisit));
      setAgreements(agreementsSnap.docs.map(doc => doc.data() as Agreement));
      setPayments(paymentsSnap.docs.map(doc => doc.data() as Payment));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to fetch system data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use email as UID for manual users to allow direct lookup during fallback login
      const uid = newUser.email.toLowerCase().trim();
      const profile: UserProfile = {
        uid,
        ...newUser,
        email: newUser.email.toLowerCase().trim(),
        tempPassword: newUser.tempPassword.trim(),
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.displayName}`,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), profile);
      toast.success(`User profile created for ${newUser.displayName} with password: ${newUser.tempPassword}`);
      setShowCreateUser(false);
      setNewUser({ displayName: '', email: '', phone: '', tempPassword: '', role: 'tenant' });
      fetchData();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Failed to create user profile");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2A5F]">Admin Console</h1>
          <p className="text-muted-foreground">System-wide overview and data management.</p>
        </div>
        <Button variant="gradient" className="gap-2 h-11 px-6 rounded-xl font-bold" onClick={() => setShowCreateUser(true)}>
          <UserPlus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      {showCreateUser && (
        <Card className="border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Create New User Profile</CardTitle>
              <CardDescription>Manually add a tenant or owner to the system.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowCreateUser(false)}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  required
                  value={newUser.displayName}
                  onChange={e => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label>Temp Password</Label>
                <Input 
                  required
                  value={newUser.tempPassword}
                  onChange={e => setNewUser({...newUser, tempPassword: e.target.value})}
                  placeholder="Set temp password"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(v: Role) => setNewUser({...newUser, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-5 flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
                <Button type="submit" variant="gradient">Create Profile</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Users</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-[#0F2A5F]">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Properties</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-[#0F2A5F]">{properties.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Visits</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-[#0F2A5F]">{visits.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Agreements</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-[#0F2A5F]">{agreements.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/10 shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-[#0F2A5F]">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-white border p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="users" className="rounded-lg gap-2 py-2 px-3"><Users className="h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="properties" className="rounded-lg gap-2 py-2 px-3"><Home className="h-4 w-4" /> Properties</TabsTrigger>
          <TabsTrigger value="visits" className="rounded-lg gap-2 py-2 px-3"><Calendar className="h-4 w-4" /> Visits</TabsTrigger>
          <TabsTrigger value="agreements" className="rounded-lg gap-2 py-2 px-3"><FileText className="h-4 w-4" /> Agreements</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg gap-2 py-2 px-3"><CreditCard className="h-4 w-4" /> Payments</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search data..." 
              className="pl-10 h-10 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <TabsContent value="users">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                              {user.photoURL && <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />}
                            </div>
                            {user.displayName}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'owner' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                          <td className="px-6 py-4 text-muted-foreground">{user.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Rent</th>
                        <th className="px-6 py-4">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(prop => (
                        <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium">{prop.title}</td>
                          <td className="px-6 py-4 text-muted-foreground">{prop.area}, {prop.city}</td>
                          <td className="px-6 py-4 font-bold">₹{prop.rent.toLocaleString()}</td>
                          <td className="px-6 py-4 text-muted-foreground">{prop.ownerName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs follow similar pattern */}
          <TabsContent value="visits">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="px-6 py-4">Property ID</th>
                        <th className="px-6 py-4">Tenant ID</th>
                        <th className="px-6 py-4">Scheduled At</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {visits.filter(v => v.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) || v.tenantId.toLowerCase().includes(searchTerm.toLowerCase())).map(visit => (
                        <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{visit.propertyId}</td>
                          <td className="px-6 py-4 font-mono text-xs">{visit.tenantId}</td>
                          <td className="px-6 py-4 text-muted-foreground">{new Date(visit.scheduledAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge variant={visit.status === 'completed' ? 'default' : 'outline'}>
                              {visit.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agreements">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="px-6 py-4">Agreement ID</th>
                        <th className="px-6 py-4">Tenant</th>
                        <th className="px-6 py-4">Rent</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agreements.filter(a => a.id.toLowerCase().includes(searchTerm.toLowerCase()) || a.tenantId.toLowerCase().includes(searchTerm.toLowerCase())).map(agreement => (
                        <tr key={agreement.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{agreement.id}</td>
                          <td className="px-6 py-4 font-mono text-xs">{agreement.tenantId}</td>
                          <td className="px-6 py-4 font-bold">₹{agreement.rent.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                              {agreement.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b text-muted-foreground font-medium">
                      <tr>
                        <th className="px-6 py-4">Payment ID</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.filter(p => p.id.toLowerCase().includes(searchTerm.toLowerCase())).map(payment => (
                        <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{payment.id}</td>
                          <td className="px-6 py-4 font-bold">₹{payment.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 capitalize">{payment.type}</td>
                          <td className="px-6 py-4">
                            <Badge variant={payment.status === 'paid' ? 'default' : 'outline'}>
                              {payment.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
