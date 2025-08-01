export default async function HomePage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Test: Simple colored background */}
      <div className="bg-orange-500 text-white p-4">
        <h1 className="text-2xl font-bold">ScrapeMaster - Color Test</h1>
      </div>
      
      {/* Test: Gradient background */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Gradient Test</h2>
        <p className="text-xl">This should have an orange gradient background</p>
      </div>
      
      {/* Test: Button styling */}
      <div className="p-8 text-center">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          Test Button with Hover Effects
        </button>
      </div>
      
      {/* Original content with simplified styling */}
      <div className="bg-white p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Web Scraping Made Simple</h1>
        <p className="text-xl text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          Extract data from any website with our powerful, user-friendly platform. No coding required.
        </p>
      </div>
    </div>
  );
}
