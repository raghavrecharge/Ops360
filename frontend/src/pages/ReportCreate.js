import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI, campaignsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReportCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsAPI.getAll().then(res => res.data),
  });

  const [campaignId, setCampaignId] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [kmTravelled, setKmTravelled] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!campaignId) return alert('Please select a campaign');
    setSubmitting(true);
    try {
      const payload = { campaign_id: parseInt(campaignId, 10), report_date: reportDate, km_travelled: kmTravelled ? parseFloat(kmTravelled) : 0 };
      if (id) {
        await reportsAPI.update(id, payload);
      } else {
        await reportsAPI.create(payload);
      }
      navigate('/reports');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to create report');
    }
  };

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsAPI.getOne(id).then(res => res.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (existing) {
      setCampaignId(existing.campaign_id ? String(existing.campaign_id) : '');
      setReportDate(existing.report_date || '');
      setKmTravelled(existing.km_travelled ? String(existing.km_travelled) : '');
    }
  }, [existing]);

  return (
    <div data-testid="report-create-page">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Create Report</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Campaign</label>
              <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required>
                <option value="">{campaignsLoading ? 'Loading campaigns...' : 'Select campaign'}</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Report Date</label>
              <input value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="mt-1 block w-full border rounded-md p-2" type="date" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">KM Travelled</label>
              <input value={kmTravelled} onChange={(e) => setKmTravelled(e.target.value)} className="mt-1 block w-full border rounded-md p-2" type="number" step="0.1" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-indigo-600" disabled={submitting}>{submitting ? (id ? 'Updating...' : 'Creating...') : (id ? 'Update' : 'Create')}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/reports')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCreate;
