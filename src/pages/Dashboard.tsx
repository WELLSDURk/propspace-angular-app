import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building, LayoutDashboard, PlusCircle, User as UserIcon, Heart, 
  ArrowRight, Key, ShieldCheck, Tag, TrendingUp, BarChart2 
} from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../components/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatFCFA } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const listings = await api.properties.getMyListings();
      setMyListings(listings);

      // Load favorites count
      const favorites = JSON.parse(localStorage.getItem('propspace_favorites') || '[]');
      setSavedCount(favorites.length);
    } catch (err: any) {
      console.error('Load dashboard data error:', err);
      setError(err.message || 'Unable to load dashboard portfolio metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (authLoading || loading) {
    return <LoadingSpinner message="Calculating portfolio valuations..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorMessage message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  // Compute metrics
  const totalListings = myListings.length;
  const rentCount = myListings.filter(p => p.status === 'For Rent').length;
  const saleCount = myListings.filter(p => p.status === 'For Sale').length;
  
  const totalSaleValue = myListings
    .filter(p => p.status === 'For Sale')
    .reduce((sum, p) => sum + p.price, 0);

  const formattedSaleValue = formatFCFA(totalSaleValue);

  const avgPrice = totalListings > 0 
    ? myListings.reduce((sum, p) => sum + p.price, 0) / totalListings
    : 0;

  const formattedAvgPrice = formatFCFA(avgPrice);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Welcome Greeting Banner */}
        <div className="bg-emerald-900 rounded-3xl text-white p-8 md:p-10 relative overflow-hidden shadow-md mb-8" id="dashboard-greeting">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center mix-blend-overlay opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                className="h-16 w-16 rounded-full border-2 border-emerald-400 object-cover bg-emerald-800"
                src={user?.avatarUrl}
                alt={user?.fullName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.username || 'user')}`;
                }}
              />
              <div>
                <span className="text-emerald-300 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> Verified Agent Account
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                  Hello, {user?.fullName}!
                </h1>
                <p className="text-sm text-emerald-100 mt-1">
                  Manage your property registrations, monitor listings feed, and oversee client inquiries.
                </p>
              </div>
            </div>

            <Link
              to="/add-property"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm rounded-2xl transition-all shadow-xs self-start md:self-auto cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5 text-emerald-600" />
              List New Property
            </Link>
          </div>
        </div>

        {/* Bento Grid Metrics Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" id="dashboard-metrics-grid">
          
          {/* Metric 1: Total listings */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 w-fit mb-4">
              <Building className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Listings</span>
            <p className="text-3xl font-black text-gray-950 mt-1">{totalListings}</p>
            <span className="text-[10px] text-gray-400 mt-1 block">Listed properties in system</span>
          </div>

          {/* Metric 2: Rent vs Sale volumes */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 w-fit mb-4">
              <Tag className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rent vs. Sale</span>
            <div className="flex gap-4 items-baseline mt-1">
              <span className="text-3xl font-black text-gray-950">{rentCount} <span className="text-xs font-normal text-gray-500">Rent</span></span>
              <span className="text-gray-300">|</span>
              <span className="text-3xl font-black text-gray-950">{saleCount} <span className="text-xs font-normal text-gray-500">Sale</span></span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">Offer allocation breakdown</span>
          </div>

          {/* Metric 3: Portfolio valuation */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 w-fit mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Portfolio Sale Value</span>
            <p className="text-3xl font-black text-gray-950 mt-1">{formattedSaleValue}</p>
            <span className="text-[10px] text-gray-400 mt-1 block">Aggregate of all For-Sale assets</span>
          </div>

          {/* Metric 4: Saved / Favorites */}
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-3 bg-red-50 rounded-2xl text-red-600 w-fit mb-4">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Saved Properties</span>
            <p className="text-3xl font-black text-gray-950 mt-1">{savedCount}</p>
            <span className="text-[10px] text-gray-400 mt-1 block">Listings you bookmarked</span>
          </div>

        </div>

        {/* Dashboard Actions and Info Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick actions */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
              <h3 className="font-extrabold text-gray-950 text-base mb-4 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-emerald-600" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Link
                  to="/add-property"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 rounded-2xl transition-colors font-semibold text-sm group"
                >
                  <span>List a New Property</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/my-listings"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 rounded-2xl transition-colors font-semibold text-sm group"
                >
                  <span>Manage My Listings ({totalListings})</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 rounded-2xl transition-colors font-semibold text-sm group"
                >
                  <span>Edit Account Profile</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-950 rounded-2xl transition-colors font-semibold text-sm group"
                >
                  <span>Browse Public Feed</span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Listing Performance overview */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="font-extrabold text-gray-950 text-base flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-emerald-600" />
                Portfolio Performance Overview
              </h3>
              <Link to="/my-listings" className="text-xs font-bold text-emerald-600 hover:underline">
                Manage All
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-12" id="dashboard-empty-state">
                <p className="text-sm text-gray-500 font-medium mb-4">You have not published any property listings yet.</p>
                <Link
                  to="/add-property"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Publish First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4" id="dashboard-recent-listings">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-extrabold">Active Portfolio Distribution</span>
                <div className="space-y-3">
                  {myListings.slice(0, 3).map((p) => (
                    <div 
                      key={p.id} 
                      className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80'} 
                          alt="" 
                          className="h-11 w-11 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1">{p.title}</h4>
                          <span className="text-[10px] text-gray-400 font-bold">{p.propertyType} • {p.location.city}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-950 text-xs">
                          {formatFCFA(p.price)}
                        </span>
                        <span className={`block text-[8px] font-extrabold uppercase mt-0.5 tracking-wider ${
                          p.status === 'For Sale' ? 'text-emerald-600' : 'text-indigo-600'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {myListings.length > 3 && (
                    <p className="text-xs text-center text-gray-400 font-bold mt-2">
                      And {myListings.length - 3} more listings...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
