import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversAPI, vendorsAPI, vehiclesAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  UserCircle, 
  Phone, 
  Mail, 
  FileText, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  Car,
  Pencil,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const Drivers = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    license_validity: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    vendor_id: '',
  });

  // Queries
  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driversAPI.getAll().then(res => res.data),
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsAPI.getAll().then(res => res.data),
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehiclesAPI.getAll().then(res => res.data),
  });

  // Helper to extract error message from API response
  const getErrorMessage = (error) => {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      // Handle validation errors (422)
      return detail.map(e => e.msg || e.message || JSON.stringify(e)).join(', ');
    }
    return 'An error occurred';
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => driversAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver created successfully');
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || 'Failed to create driver');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => driversAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver updated successfully');
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update driver');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => driversAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['drivers']);
      toast.success('Driver deleted successfully');
      setIsDeleteOpen(false);
      setSelectedDriver(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete driver');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      license_number: '',
      license_validity: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      vendor_id: '',
    });
    setSelectedDriver(null);
  };

  const handleCreate = () => {
    const submitData = { ...formData };
    if (!submitData.vendor_id) delete submitData.vendor_id;
    else submitData.vendor_id = parseInt(submitData.vendor_id);
    createMutation.mutate(submitData);
  };

  const handleUpdate = () => {
    const submitData = { ...formData };
    if (!submitData.vendor_id) delete submitData.vendor_id;
    else submitData.vendor_id = parseInt(submitData.vendor_id);
    updateMutation.mutate({ id: selectedDriver.id, data: submitData });
  };

  const openEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name || '',
      phone: driver.phone || '',
      email: driver.email || '',
      license_number: driver.license_number || '',
      license_validity: driver.license_validity || '',
      address: driver.address || '',
      emergency_contact: driver.emergency_contact || '',
      emergency_phone: driver.emergency_phone || '',
      vendor_id: driver.vendor_id?.toString() || '',
    });
    setIsEditOpen(true);
  };

  const openView = (driver) => {
    setSelectedDriver(driver);
    setIsViewOpen(true);
  };

  const openDelete = (driver) => {
    setSelectedDriver(driver);
    setIsDeleteOpen(true);
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors?.find(v => v.id === vendorId);
    return vendor?.name || 'Not Assigned';
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle?.vehicle_number || 'Not Assigned';
  };

  const isLicenseExpiringSoon = (validityDate) => {
    if (!validityDate) return false;
    const validity = new Date(validityDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((validity - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isLicenseExpired = (validityDate) => {
    if (!validityDate) return false;
    return new Date(validityDate) < new Date();
  };

  return (
    <div data-testid="drivers-page">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Drivers</h1>
          <p className="text-slate-600">Manage driver information and assignments</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          data-testid="add-driver-btn"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Drivers</p>
                <p className="text-2xl font-bold text-green-700">{drivers?.length || 0}</p>
              </div>
              <UserCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">With Vehicles</p>
                <p className="text-2xl font-bold text-blue-700">
                  {drivers?.filter(d => d.assigned_vehicle_id).length || 0}
                </p>
              </div>
              <Car className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">License Expiring</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {drivers?.filter(d => isLicenseExpiringSoon(d.license_validity)).length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">License Expired</p>
                <p className="text-2xl font-bold text-red-700">
                  {drivers?.filter(d => isLicenseExpired(d.license_validity)).length || 0}
                </p>
              </div>
              <X className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : drivers?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <UserCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>No drivers found. Click "Add Driver" to create one.</p>
          </div>
        ) : (
          drivers?.map((driver) => (
            <Card 
              key={driver.id} 
              data-testid="driver-card"
              className={`hover:shadow-lg transition-shadow ${
                isLicenseExpired(driver.license_validity) 
                  ? 'border-red-300 bg-red-50' 
                  : isLicenseExpiringSoon(driver.license_validity) 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : ''
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isLicenseExpired(driver.license_validity) 
                        ? 'bg-red-100' 
                        : isLicenseExpiringSoon(driver.license_validity) 
                          ? 'bg-yellow-100' 
                          : 'bg-green-100'
                    }`}>
                      <UserCircle className={`h-6 w-6 ${
                        isLicenseExpired(driver.license_validity) 
                          ? 'text-red-600' 
                          : isLicenseExpiringSoon(driver.license_validity) 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{driver.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {driver.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openView(driver)}
                      data-testid={`view-driver-${driver.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEdit(driver)}
                      data-testid={`edit-driver-${driver.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => openDelete(driver)}
                      data-testid={`delete-driver-${driver.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <FileText className="h-3 w-3" /> License:
                  </div>
                  <span className="font-medium">{driver.license_number || 'N/A'}</span>
                  
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="h-3 w-3" /> Valid Until:
                  </div>
                  <span className={`font-medium ${
                    isLicenseExpired(driver.license_validity) 
                      ? 'text-red-600' 
                      : isLicenseExpiringSoon(driver.license_validity) 
                        ? 'text-yellow-600' 
                        : ''
                  }`}>
                    {formatDate(driver.license_validity)}
                    {isLicenseExpired(driver.license_validity) && ' (Expired)'}
                    {isLicenseExpiringSoon(driver.license_validity) && ' (Expiring Soon)'}
                  </span>
                  
                  <div className="flex items-center gap-1 text-slate-600">
                    <Car className="h-3 w-3" /> Vehicle:
                  </div>
                  <span className="font-medium">{getVehicleInfo(driver.assigned_vehicle_id)}</span>
                </div>
                
                {driver.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Driver Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter driver details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                data-testid="driver-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Driver name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  data-testid="driver-phone-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="driver-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  data-testid="driver-license-input"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="DL12345"
                />
              </div>
              <div>
                <Label htmlFor="license_validity">License Validity</Label>
                <Input
                  id="license_validity"
                  type="date"
                  data-testid="driver-validity-input"
                  value={formData.license_validity}
                  onChange={(e) => setFormData({ ...formData, license_validity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                data-testid="driver-address-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  data-testid="driver-emergency-contact-input"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergency_phone">Emergency Phone</Label>
                <Input
                  id="emergency_phone"
                  data-testid="driver-emergency-phone-input"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="vendor_id">Vendor (Optional)</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              >
                <SelectTrigger data-testid="driver-vendor-select">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!formData.name || createMutation.isPending}
              data-testid="create-driver-submit"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update driver information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                data-testid="edit-driver-name-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Driver name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-license">License Number</Label>
                <Input
                  id="edit-license"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="DL12345"
                />
              </div>
              <div>
                <Label htmlFor="edit-validity">License Validity</Label>
                <Input
                  id="edit-validity"
                  type="date"
                  value={formData.license_validity}
                  onChange={(e) => setFormData({ ...formData, license_validity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-emergency-contact">Emergency Contact</Label>
                <Input
                  id="edit-emergency-contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="edit-emergency-phone">Emergency Phone</Label>
                <Input
                  id="edit-emergency-phone"
                  value={formData.emergency_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-vendor">Vendor</Label>
              <Select
                value={formData.vendor_id}
                onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!formData.name || updateMutation.isPending}
              data-testid="update-driver-submit"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Driver Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="p-4 bg-green-100 rounded-full">
                  <UserCircle className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedDriver.name}</h2>
                  <p className="text-slate-600">{selectedDriver.email || 'No email'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {selectedDriver.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">License Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" /> {selectedDriver.license_number || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">License Valid Until</p>
                  <p className={`font-medium flex items-center gap-2 ${
                    isLicenseExpired(selectedDriver.license_validity) 
                      ? 'text-red-600' 
                      : isLicenseExpiringSoon(selectedDriver.license_validity) 
                        ? 'text-yellow-600' 
                        : ''
                  }`}>
                    <Calendar className="h-4 w-4" /> 
                    {formatDate(selectedDriver.license_validity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Vendor</p>
                  <p className="font-medium">{getVendorName(selectedDriver.vendor_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Assigned Vehicle</p>
                  <p className="font-medium flex items-center gap-2">
                    <Car className="h-4 w-4" /> {getVehicleInfo(selectedDriver.assigned_vehicle_id)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedDriver.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDriver.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {selectedDriver.address && (
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5" /> {selectedDriver.address}
                  </p>
                </div>
              )}

              {(selectedDriver.emergency_contact || selectedDriver.emergency_phone) && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Emergency Contact
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Name</p>
                      <p className="font-medium">{selectedDriver.emergency_contact || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{selectedDriver.emergency_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t text-sm text-slate-500">
                <p>Created: {formatDate(selectedDriver.created_at)}</p>
                {selectedDriver.updated_at && (
                  <p>Last Updated: {formatDate(selectedDriver.updated_at)}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEdit(selectedDriver); }}>
              Edit Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedDriver?.name}</strong>? 
              This action will deactivate the driver record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(selectedDriver.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-driver"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Drivers;
