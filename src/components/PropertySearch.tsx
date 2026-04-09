import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Property } from '@/types';
import { PropertyCard } from './PropertyCard';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import { Search, MapPin, Filter, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface PropertySearchProps {
  onSelectProperty: (property: Property) => void;
}

export function PropertySearch({ onSelectProperty }: PropertySearchProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('All');
  const [budget, setBudget] = useState('All');
  const [bedrooms, setBedrooms] = useState('All');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'properties'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'properties');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationDetection = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        toast.success(`Location detected: ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        // In a real app, we would filter by distance here
      }, (error) => {
        toast.error("Error detecting location: " + error.message);
      });
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = city === 'All' || p.city === city;
    const matchesBedrooms = bedrooms === 'All' || p.bedrooms === parseInt(bedrooms);
    const matchesBudget = budget === 'All' || 
                         (budget === '0-20k' && p.rent <= 20000) ||
                         (budget === '20k-40k' && p.rent > 20000 && p.rent <= 40000) ||
                         (budget === '40k+' && p.rent > 40000);
    
    return matchesSearch && matchesCity && matchesBedrooms && matchesBudget && !p.isOccupied;
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#0F2A5F]">
          Find your perfect <span className="text-brand-gradient">home</span>
        </h1>
        <p className="text-lg text-muted-foreground">Search from thousands of verified rental flats in your preferred location with FlatFlow.</p>
      </div>

      <div className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by area or property name..." 
            className="pl-11 h-12 rounded-xl border-slate-200 focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Cities</SelectItem>
              <SelectItem value="Hyderabad">Hyderabad</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-12 rounded-xl gap-2 border-slate-200 text-slate-600 hover:text-primary" onClick={handleLocationDetection}>
            <Navigation className="h-4 w-4" />
            <span className="hidden sm:inline">Near Me</span>
            <span className="sm:hidden">GPS</span>
          </Button>

          <div className="col-span-2 md:col-span-1">
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder="BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All BHK</SelectItem>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2A5F] whitespace-nowrap">
          <Filter className="h-4 w-4" />
          Budget:
        </div>
        <div className="flex gap-2">
          {['All', '0-20k', '20k-40k', '40k+'].map((b) => (
            <Button
              key={b}
              variant={budget === b ? 'default' : 'outline'}
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => setBudget(b)}
            >
              {b === 'All' ? 'All' : b === '0-20k' ? '< 20k' : b === '20k-40k' ? '20k - 40k' : '> 40k'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[350px] rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(p => (
            <div key={p.id}>
              <PropertyCard 
                property={p} 
                onSelect={onSelectProperty} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No properties found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
