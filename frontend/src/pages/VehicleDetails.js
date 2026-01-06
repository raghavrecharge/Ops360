import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehiclesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => vehiclesAPI.getOne(id).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{vehicle.vehicle_number}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/vehicles/${id}/edit`)}>Edit</Button>
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>Back</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Vehicle Details</h3>
          <div><strong>Number:</strong> {vehicle.vehicle_number}</div>
          <div><strong>Type:</strong> {vehicle.vehicle_type || '-'}</div>
          <div><strong>Capacity:</strong> {vehicle.capacity || '-'}</div>
          <div><strong>Vendor:</strong> {vehicle.vendor ? (
            <Button variant="link" onClick={() => navigate(`/vendors/${vehicle.vendor.id}`)}>{vehicle.vendor.name}</Button>
          ) : '-'}</div>
          <div><strong>RC Validity:</strong> {vehicle.rc_validity ? formatDate(vehicle.rc_validity) : '-'}</div>
          <div><strong>Insurance Validity:</strong> {vehicle.insurance_validity ? formatDate(vehicle.insurance_validity) : '-'}</div>
          <div><strong>Permit Validity:</strong> {vehicle.permit_validity ? formatDate(vehicle.permit_validity) : '-'}</div>
          <div className="text-sm text-slate-500 mt-3">Created: {formatDate(vehicle.created_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
