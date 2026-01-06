import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsAPI.getOne(id).then(res => res.data),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!campaign) return <div>Campaign not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/campaigns/${id}/edit`)}>Edit</Button>
          <Button variant="ghost" onClick={() => navigate('/campaigns')}>Back</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Campaign Details</h3>
          <div><strong>Name:</strong> {campaign.name}</div>
          <div><strong>Description:</strong> {campaign.description || '-'}</div>
          <div><strong>Type:</strong> {campaign.campaign_type}</div>
          <div><strong>Status:</strong> {campaign.status}</div>
          <div><strong>Start:</strong> {campaign.start_date ? formatDate(campaign.start_date) : '-'}</div>
          <div><strong>End:</strong> {campaign.end_date ? formatDate(campaign.end_date) : '-'}</div>
          <div><strong>Budget:</strong> {campaign.budget ?? '-'}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Project</h3>
          {campaign.project_id ? (
            <Button variant="link" onClick={() => navigate(`/projects/${campaign.project_id}`)}>View Project</Button>
          ) : <div className="text-sm text-slate-500">No project</div>}
          <div className="text-sm text-slate-500 mt-3">Created: {formatDate(campaign.created_at)}</div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
