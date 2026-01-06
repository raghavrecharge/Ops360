import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { vendorsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

const Vendors = () => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsAPI.getAll().then(res => res.data),
  });
  const navigate = useNavigate();

  return (
    <div data-testid="vendors-page">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Vendors</h1>
          <p className="text-slate-600">Manage vendor partnerships</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-vendor-btn" onClick={() => navigate('/vendors/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : vendors?.length === 0 ? (
          <div className="col-span-full text-center py-12">No vendors found</div>
        ) : (
          vendors?.map((vendor) => (
            <Card key={vendor.id} data-testid="vendor-card">
              <CardHeader>
                <h3 className="font-bold text-lg">{vendor.name}</h3>
                <p className="text-sm text-slate-600">{vendor.company}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-600">{vendor.email}</p>
                <p className="text-sm text-slate-600">{vendor.phone}</p>
                <p className="text-xs text-slate-500">Added: {formatDate(vendor.created_at)}</p>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate(`/vendors/${vendor.id}`)}>View Details</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Vendors;
