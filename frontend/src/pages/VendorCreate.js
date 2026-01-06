import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendorsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VendorCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, company, email, phone, address };
      if (id) {
        await vendorsAPI.update(id, payload);
      } else {
        await vendorsAPI.create(payload);
      }
      navigate('/vendors');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to create vendor');
    }
  };

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsAPI.getOne(id).then(res => res.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (existing) {
      setName(existing.name || '');
      setCompany(existing.company || '');
      setEmail(existing.email || '');
      setPhone(existing.phone || '');
      setAddress(existing.address || '');
    }
  }, [existing]);

  return (
    <div data-testid="vendor-create-page">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Add Vendor</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Company</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="mt-1 block w-full border rounded-md p-2" type="email" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-indigo-600" disabled={submitting}>{submitting ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update' : 'Add')}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/vendors')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCreate;
