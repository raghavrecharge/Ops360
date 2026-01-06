import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendorsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsAPI.getOne(id).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{vendor.name}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/vendors/${id}/edit`)}>Edit</Button>
          <Button variant="ghost" onClick={() => navigate('/vendors')}>Back</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Vendor Details</h3>
          <div><strong>Name:</strong> {vendor.name}</div>
          <div><strong>Company:</strong> {vendor.company || '-'}</div>
          <div><strong>Email:</strong> {vendor.email || '-'}</div>
          <div><strong>Phone:</strong> {vendor.phone || '-'}</div>
          <div><strong>Address:</strong> {vendor.address || '-'}</div>
          <div className="text-sm text-slate-500 mt-3">Created: {formatDate(vendor.created_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
