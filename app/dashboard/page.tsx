'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '../../utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import CreateJobModal from '../../components/CreateJobModal';
import JobResultsModal from '../../components/JobResultsModal';
import JobDetailsModal from '../../components/JobDetailsModal';
import StatusBadge from '../../components/StatusBadge';
import BulkJobModal from '../../components/BulkJobModal';
import { formatDate, truncateUrl, downloadCSV, downloadJSON } from '../../utils/helpers';

interface ScrapingJob {
  id: string;
  name: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  selectors?: any;
  settings?: any;
  data?: any;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<{ id: string; name: string } | null>(null);
  const [viewJobDetails, setViewJobDetails] = useState<string | null>(null);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    getUser();
    getJobs();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      window.location.href = '/auth/signin';
    }
  };

  const getJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const runJob = async (jobId: string) => {
    setRunningJobs(prev => new Set(prev).add(jobId));
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh jobs to show updated status
        await getJobs();
        alert(`Scraping completed! Found ${result.count} items.`);
      } else {
        alert(`Scraping failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error running job:', error);
      alert('Failed to run scraping job');
    } finally {
      setRunningJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const exportJobs = (format: 'csv' | 'json') => {
    const exportData = jobs.map(job => ({
      name: job.name,
      url: job.url,
      status: job.status,
      created_at: job.created_at,
      selectors: JSON.stringify(job.selectors),
      settings: JSON.stringify(job.settings)
    }));

    const filename = `scraping_jobs_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      downloadCSV(exportData, filename);
    } else {
      downloadJSON(jobs, filename);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">ScrapeMaster</h1>
              <span className="ml-4 px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs.filter(job => job.status === 'running').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs.filter(job => job.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Job Buttons */}
        <div className="mb-6 flex space-x-3">
          <button
            onClick={() => setShowCreateJob(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Job
          </button>
          <button
            onClick={() => setShowBulkCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Bulk Create
          </button>
        </div>

        {/* Jobs List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Jobs</h3>
            {jobs.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => exportJobs('csv')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportJobs('json')}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                >
                  Export JSON
                </button>
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            {jobs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scraping jobs</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new scraping job.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {job.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" title={job.url}>
                          {truncateUrl(job.url)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(job.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {job.status === 'pending' && (
                            <button
                              onClick={() => runJob(job.id)}
                              disabled={runningJobs.has(job.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-2"
                            >
                              {runningJobs.has(job.id) ? 'Running...' : 'Run'}
                            </button>
                          )}
                          {job.status === 'completed' && (
                            <button 
                              onClick={() => setSelectedJob({ id: job.id, name: job.name })}
                              className="text-blue-600 hover:text-blue-900 mr-4 text-xs"
                            >
                              View Results
                            </button>
                          )}
                          <button 
                            onClick={() => setViewJobDetails(job.id)}
                            className="text-orange-600 hover:text-orange-900 mr-4 text-xs"
                          >
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-xs">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateJob}
        onClose={() => setShowCreateJob(false)}
        onJobCreated={getJobs}
      />

      {/* Bulk Create Modal */}
      <BulkJobModal
        isOpen={showBulkCreate}
        onClose={() => setShowBulkCreate(false)}
        onJobsCreated={getJobs}
      />

      {/* Job Results Modal */}
      {selectedJob && (
        <JobResultsModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          jobId={selectedJob.id}
          jobName={selectedJob.name}
        />
      )}

      {/* Job Details Modal */}
      {viewJobDetails && (
        <JobDetailsModal
          isOpen={!!viewJobDetails}
          onClose={() => setViewJobDetails(null)}
          jobId={viewJobDetails}
        />
      )}
    </div>
  );
}
