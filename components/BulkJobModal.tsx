'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '../utils/supabaseClient';

interface BulkJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobsCreated: () => void;
}

export default function BulkJobModal({ isOpen, onClose, onJobsCreated }: BulkJobModalProps) {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowser();

  const handleBulkCreate = async () => {
    if (!csvData.trim()) {
      setError('Please paste CSV data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      if (!headers.includes('name') || !headers.includes('url')) {
        throw new Error('CSV must contain "name" and "url" columns');
      }

      const jobs = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const job: any = {
          user_id: user.id,
          selectors: {},
          settings: { delay: 1000, maxPages: 1, includeImages: false },
          status: 'pending'
        };

        headers.forEach((header, index) => {
          if (header === 'name' || header === 'url') {
            job[header] = values[index];
          }
        });

        if (job.name && job.url) {
          jobs.push(job);
        }
      }

      if (jobs.length === 0) {
        throw new Error('No valid jobs found in CSV');
      }

      const { error: insertError } = await supabase
        .from('scraping_jobs')
        .insert(jobs);

      if (insertError) throw insertError;

      alert(`Successfully created ${jobs.length} jobs!`);
      setCsvData('');
      onJobsCreated();
      onClose();
    } catch (error: any) {
      console.error('Failed to create bulk jobs:', error);
      setError(error.message || 'Failed to create jobs');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Create Jobs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Paste CSV data with columns: <code className="bg-gray-100 px-1 rounded">name, url</code>
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 mb-4">
              <strong>Example:</strong><br/>
              name,url<br/>
              "Quotes Site","https://quotes.toscrape.com/"<br/>
              "News Site","https://example.com/"
            </div>
          </div>

          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder="Paste your CSV data here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCreate}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Jobs...' : 'Create Jobs'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
