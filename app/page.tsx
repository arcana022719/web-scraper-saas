import { createSupabaseBrowser } from '../utils/supabaseClient';

export default async function HomePage() {
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-supabase-url' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-supabase-anon-key';

  let user = null;
  
  if (isSupabaseConfigured) {
    const supabase = createSupabaseBrowser();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ScrapeMaster</h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isSupabaseConfigured ? (
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  Demo Mode
                </span>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Web Scraping Made{' '}
              <span className="text-orange-500">Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Extract data from any website with our powerful, user-friendly platform. 
              No coding required - just point, click, and scrape.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors">
                {!isSupabaseConfigured ? 'Try Demo (Setup Required)' : 'Start Scraping Now'}
              </button>
              <button className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to scrape the web
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make web scraping accessible to everyone
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600">
                Extract data from thousands of pages in minutes with our optimized scraping engine
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Code Required</h3>
              <p className="text-gray-600">
                Visual interface makes web scraping accessible to everyone, no programming needed
              </p>
            </div>
            
            <div className="p-8 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multiple Exports</h3>
              <p className="text-gray-600">
                Export your data in CSV, JSON, Excel, or connect directly to your database
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Instructions */}
      {!isSupabaseConfigured && (
        <section className="py-16 bg-orange-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🚀 Setup Required to Enable Full Features
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create Supabase Project</h3>
                  <p className="text-gray-600 text-sm">
                    Visit <a href="https://supabase.com" className="text-orange-600 hover:text-orange-700 underline">supabase.com</a> and create a new project
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Get Credentials</h3>
                  <p className="text-gray-600 text-sm">
                    Copy your project URL and anon key from the API settings
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Update Environment</h3>
                  <p className="text-gray-600 text-sm">
                    Add your credentials to the <code className="bg-gray-100 px-1 rounded">.env.local</code> file
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-orange-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start scraping?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of developers and businesses who trust ScrapeMaster
          </p>
          <button className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold mb-4">ScrapeMaster</h3>
          <p className="text-gray-400 mb-8">
            The most powerful and user-friendly web scraping platform
          </p>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">&copy; 2024 ScrapeMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
