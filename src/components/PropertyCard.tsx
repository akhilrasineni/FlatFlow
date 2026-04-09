import React from 'react';
import { Property } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, MapPin, IndianRupee } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onSelect(property)}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={property.images[0] || `https://picsum.photos/seed/${property.id}/800/600`} 
          alt={property.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {property.bedrooms} BHK
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4">
        <h3 className="font-bold text-lg line-clamp-1 text-[#0F2A5F]">{property.title}</h3>
        <div className="flex items-center text-muted-foreground text-sm gap-1">
          <MapPin className="h-3 w-3 text-[#14B8A6]" />
          <span className="line-clamp-1">{property.area}, {property.city}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-bold text-xl text-[#0F2A5F]">
            <IndianRupee className="h-5 w-5 text-[#14B8A6]" />
            {property.rent.toLocaleString('en-IN')}
            <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
            <Bed className="h-4 w-4" />
            {property.bedrooms} BHK
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full rounded-lg border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-semibold">View Details</Button>
      </CardFooter>
    </Card>
  );
}
