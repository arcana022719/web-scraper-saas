'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowser } from '../utils/supabaseClient';

interface JobResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobName: string;
}

export default function JobResultsModal({ isOpen, onClose, jobId, jobName }: JobResultsModalProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (isOpen && jobId) {
      fetchResults();
    }
  }, [isOpen, jobId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scraping_jobs')
        .select('data')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setResults(data?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    // Get all unique keys from the results
    const keys = Array.from(new Set(results.flatMap(item => Object.keys(item))));
    
    // Create CSV header
    const csvContent = [
      keys.join(','),
      ...results.map(item => 
        keys.map(key => {
          const value = item[key] || '';
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jobName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scraping Results</h2>
            <p className="text-sm text-gray-600">{jobName}</p>
          </div>
          <div className="flex items-center space-x-4">
            {results.length > 0 && (
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Export CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
              <p className="mt-1 text-sm text-gray-500">This job didn't extract any data.</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Found <span className="font-medium">{results.length}</span> items
                </p>
              </div>

              <div className="grid gap-4">
                {results.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {key}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {key === 'image' && value ? (
                              <img 
                                src={value as string} 
                                alt="Scraped content" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ) : key === 'url' && value ? (
                              <a 
                                href={value as string} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate block"
                              >
                                {value as string}
                              </a>
                            ) : (
                              <span className="break-words">{value as string}</span>
                            )}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
