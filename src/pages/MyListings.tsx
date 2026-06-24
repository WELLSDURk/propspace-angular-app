import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Building, Trash2, Edit3, HelpCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../components/AuthContext';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const MyListings: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const loadListings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.properties.getMyListings();
      setListings(data);
    } catch (err: any) {
      console.error('Fetch my listings error:', err);
      setError(err.message || 'Failed to retrieve your properties listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const handleEdit = (id: string) => {
    navigate(`/edit-property/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? (Soft delete will mark this property as deleted)')) {
      return;
    }

    try {
      setLoading(true);
      await api.properties.delete(id);
      // Reload listings
      const data = await api.properties.getMyListings();
      setListings(data);
    } catch (err: any) {
      alert(err.message || 'Failed to delete property.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Scanning your private listings feed..." fullPage />;
  }

  if (error) {
    return (
      <div className="py-16">
        <ErrorMessage message={error} onRetry={loadListings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="my-listings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
              <Building className="h-7 w-7 text-emerald-600" />
              My Registered Properties
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Oversee, update, and manage the properties you have listed on PropSpace.
            </p>
          </div>

          <Link
            to="/add-property"
            className="inline-flex items-center gap-1.5 px-4.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs hover:shadow-md cursor-pointer self-start sm:self-auto"
            id="my-listings-add-btn"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            List a Property
          </Link>
        </div>

        {/* Listings Display */}
        {listings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center max-w-xl mx-auto shadow-xs" id="my-listings-empty">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-950 mb-2">No Active Listings Yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              You haven't listed any properties. Create your first listing to display it here and publish it to our public browsing board.
            </p>
            <Link
              to="/add-property"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="my-listings-grid">
            {listings.map((property) => (
              <div key={property.id} className="h-full">
                <PropertyCard 
                  property={property} 
                  isOwner={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
