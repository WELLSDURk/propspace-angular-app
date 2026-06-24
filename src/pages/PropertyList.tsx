import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, HelpCircle, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';
import { Property, FilterParams } from '../types';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    city: '',
    propertyType: 'All',
    status: 'All',
    minPrice: undefined,
    maxPrice: undefined,
    bedrooms: undefined,
    sortBy: 'date_added'
  });

  // Local inputs state for delayed search action
  const [searchInput, setSearchInput] = useState('');
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [bedroomsInput, setBedroomsInput] = useState('');

  // Sidebar visibility for mobile
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchProperties = async (currentFilters: FilterParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.properties.getAll(currentFilters);
      setProperties(data);
    } catch (err: any) {
      console.error('Fetch properties error:', err);
      setError(err.message || 'Unable to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch properties on mount & when filters (that trigger immediately) change
  useEffect(() => {
    fetchProperties(filters);
  }, [filters.propertyType, filters.status, filters.sortBy]);

  // Handle manual submit of form search & numerical parameters
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...filters,
      search: searchInput,
      minPrice: minPriceInput ? parseFloat(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? parseFloat(maxPriceInput) : undefined,
      bedrooms: bedroomsInput ? parseInt(bedroomsInput, 10) : undefined,
    };
    setFilters(updated);
    fetchProperties(updated);
    setShowFiltersMobile(false);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setBedroomsInput('');
    const resetFilters = {
      search: '',
      city: '',
      propertyType: 'All',
      status: 'All',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      sortBy: 'date_added'
    };
    setFilters(resetFilters);
    fetchProperties(resetFilters);
    setShowFiltersMobile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="property-list-page">
      {/* Visual Hero Header */}
      <div className="bg-emerald-950 text-white py-16 px-4 text-center relative overflow-hidden" id="property-list-hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-25" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" id="hero-title">
            Find Your Dream Space
          </h1>
          <p className="text-emerald-100 font-medium md:text-lg mb-8 leading-relaxed">
            Discover verified houses, penthouses, modern studios, and commercial properties for rent and sale.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleApplyFilters} className="bg-white p-2 rounded-2xl md:rounded-3xl shadow-lg flex flex-col md:flex-row gap-2 max-w-2xl mx-auto" id="hero-search-form">
            <div className="flex-1 flex items-center gap-2 px-4 py-2 text-gray-800">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title, location, country..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full text-sm font-semibold text-gray-900 outline-hidden border-none placeholder-gray-400 bg-transparent"
                id="search-input"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-3 rounded-xl md:rounded-2xl text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              id="search-submit-btn"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 1. FILTER SIDEBAR (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs h-fit sticky top-24" id="desktop-filter-sidebar">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                Advanced Filters
              </h3>
              <button 
                onClick={handleClearFilters}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                id="desktop-clear-filters"
              >
                Reset All
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Property Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['All', 'Apartment', 'House', 'Studio', 'Villa', 'Commercial'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilters({ ...filters, propertyType: type })}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        filters.propertyType === type
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Offer Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['All', 'For Rent', 'For Sale'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilters({ ...filters, status: status })}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        filters.status === status
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status === 'All' ? 'All' : status.replace('For ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Price Range (FCFA)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                  />
                  <span className="text-gray-400 text-xs font-semibold">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Bedrooms</label>
                <input
                  type="number"
                  placeholder="e.g. 3"
                  min="0"
                  value={bedroomsInput}
                  onChange={(e) => setBedroomsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                />
              </div>

              {/* Apply Filter Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Apply Parameters
              </button>
            </form>
          </div>

          {/* 2. PROPERTIES LISTINGS FEED GRID */}
          <div className="flex-1">
            
            {/* Sort & Mobile filter trigger bar */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4" id="results-bar">
              <span className="text-sm font-semibold text-gray-600">
                {loading ? 'Searching...' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
              </span>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowFiltersMobile(true)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer"
                  id="mobile-filter-toggle"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
                  Filters
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 hidden sm:inline" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="bg-gray-50 text-gray-700 font-semibold text-xs py-2 pl-3 pr-8 border border-gray-200 focus:border-emerald-500 rounded-xl focus:outline-hidden cursor-pointer"
                    id="sort-select"
                  >
                    <option value="date_added">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="area_desc">Area: Largest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main async data displays */}
            {loading ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 shadow-xs flex items-center justify-center" id="listings-loading">
                <LoadingSpinner message="Scanning our real-estate registries..." />
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => fetchProperties(filters)} />
            ) : properties.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-xs" id="listings-empty">
                <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Properties Match Your Criteria</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any listings matching your parameters. Try clearing some filters or searching for another term.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
                  id="empty-reset-btn"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="listings-grid">
                {properties.map((property) => (
                  <div key={property.id} className="h-full">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. MOBILE FILTER SIDEBAR OVERLAY */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" id="mobile-filter-overlay">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-6 shadow-2xl flex flex-col h-full">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-bold text-gray-950 text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">Property Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['All', 'Apartment', 'House', 'Studio', 'Villa', 'Commercial'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilters({ ...filters, propertyType: type })}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          filters.propertyType === type
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">Offer Status</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['All', 'For Rent', 'For Sale'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFilters({ ...filters, status: status })}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                          filters.status === status
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {status === 'All' ? 'All' : status.replace('For ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">Price Range (FCFA)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden text-gray-900"
                    />
                    <span className="text-gray-400 text-xs font-semibold">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden text-gray-900"
                    />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">Bedrooms</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    min="0"
                    value={bedroomsInput}
                    onChange={(e) => setBedroomsInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-hidden text-gray-900"
                  />
                </div>

                {/* Apply / Reset buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-100 mt-auto">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex-1 py-3 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
