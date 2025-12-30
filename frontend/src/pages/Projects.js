import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const Projects = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(res => res.data),
  });

  return (
    <div data-testid="projects-page">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Projects</h1>
          <p className="text-slate-600">Manage your project portfolio</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="add-project-btn">
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading projects...</div>
        ) : projects?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No projects found</div>
        ) : (
          projects?.map((project) => (
            <Card key={project.id} data-testid="project-card" className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      {project.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-600 line-clamp-2">{project.description || 'No description'}</p>
                {project.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">View Details</Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
