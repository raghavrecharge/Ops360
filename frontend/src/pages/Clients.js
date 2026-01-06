import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsAPI.getAll().then(res => res.data),
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  const navigate = useNavigate();

  return (
    <div data-testid="clients-page">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Clients</h1>
          <p className="text-slate-600">Manage your client relationships</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-client-btn" onClick={() => navigate('/clients/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search clients..."
                className="pl-10"
                data-testid="search-clients-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No clients found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="clients-table">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Company</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="client-row">
                      <td className="py-3 px-4">{client.name}</td>
                      <td className="py-3 px-4 text-slate-600">{client.company || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{client.email || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{client.phone || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(client.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${client.id}`)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
