'use client';

import { useState } from 'react';
import { createSupabaseBrowser } from '../utils/supabaseClient';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    selectors: {
      container: '',
      title: '',
      price: '',
      description: '',
      image: ''
    },
    settings: {
      delay: 1000,
      maxPages: 1,
      includeImages: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createSupabaseBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Creating job with data:', {
        user_id: user.id,
        name: formData.name,
        url: formData.url,
        selectors: formData.selectors,
        settings: formData.settings,
        status: 'pending'
      });

      const { data, error: insertError } = await supabase
        .from('scraping_jobs')
        .insert({
          user_id: user.id,
          name: formData.name,
          url: formData.url,
          selectors: formData.selectors,
          settings: formData.settings,
          status: 'pending'
        })
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Job created successfully:', data);

      // Reset form and close modal
      setFormData({
        name: '',
        url: '',
        selectors: {
          container: '',
          title: '',
          price: '',
          description: '',
          image: ''
        },
        settings: {
          delay: 1000,
          maxPages: 1,
          includeImages: false
        }
      });
      onJobCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Scraping Job</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Job Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Amazon Product Prices"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Target URL *
              </label>
              <input
                type="url"
                id="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://example.com/products"
              />
            </div>
          </div>

          {/* CSS Selectors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Data Extraction</h3>
            <p className="text-sm text-gray-600">
              Specify CSS selectors to extract data. Leave empty if not needed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="container" className="block text-sm font-medium text-gray-700 mb-2">
                  Container Selector
                </label>
                <input
                  type="text"
                  id="container"
                  value={formData.selectors.container}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectors: { ...formData.selectors, container: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder=".product-card"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title Selector
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.selectors.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectors: { ...formData.selectors, title: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="h2.product-title"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price Selector
                </label>
                <input
                  type="text"
                  id="price"
                  value={formData.selectors.price}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectors: { ...formData.selectors, price: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder=".price"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description Selector
                </label>
                <input
                  type="text"
                  id="description"
                  value={formData.selectors.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    selectors: { ...formData.selectors, description: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder=".description"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (ms)
                </label>
                <input
                  type="number"
                  id="delay"
                  min="500"
                  max="10000"
                  value={formData.settings.delay}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, delay: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Pages
                </label>
                <input
                  type="number"
                  id="maxPages"
                  min="1"
                  max="50"
                  value={formData.settings.maxPages}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, maxPages: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeImages"
                checked={formData.settings.includeImages}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, includeImages: e.target.checked }
                })}
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="includeImages" className="ml-2 text-sm text-gray-700">
                Include image URLs
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
