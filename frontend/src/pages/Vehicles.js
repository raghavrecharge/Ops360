import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Truck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const Vehicles = () => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesAPI.getAll().then(res => res.data),
  });

  return (
    <div data-testid="vehicles-page">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Vehicles</h1>
          <p className="text-slate-600">Manage your fleet vehicles</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-vehicle-btn">
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : vehicles?.length === 0 ? (
          <div className="col-span-full text-center py-12">No vehicles found</div>
        ) : (
          vehicles?.map((vehicle) => (
            <Card key={vehicle.id} data-testid="vehicle-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Truck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vehicle.vehicle_number}</h3>
                    <p className="text-sm text-slate-600">{vehicle.vehicle_type}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-slate-600">Capacity:</span>
                  <span className="font-medium">{vehicle.capacity || 'N/A'}</span>
                  <span className="text-slate-600">RC Valid:</span>
                  <span className="font-medium">{formatDate(vehicle.rc_validity)}</span>
                  <span className="text-slate-600">Insurance:</span>
                  <span className="font-medium">{formatDate(vehicle.insurance_validity)}</span>
                </div>
                <Button variant="outline" className="w-full mt-4">View Details</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Vehicles;
