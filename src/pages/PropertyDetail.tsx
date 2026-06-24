import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Bed, Bath, Maximize2, MapPin, Phone, Mail, User as UserIcon, 
  Trash2, Edit3, Send, AlertCircle, ArrowLeft, Heart, Calendar 
} from 'lucide-react';
import { api, getAuthToken } from '../services/api';
import { Property } from '../types';
import { useAuth } from '../components/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatFCFA } from '../utils/format';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Favorite
  const [isFavorite, setIsFavorite] = useState(false);

  // Contact Agent Form
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchPropertyDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.properties.getById(id);
      setProperty(data);
      
      // Auto pre-populate contact details if user is logged in
      if (user) {
        setSenderName(user.fullName);
        setSenderEmail(user.email);
        setSenderPhone(user.phoneNumber || '');
      }
      
      // Favorite state
      const favorites = JSON.parse(localStorage.getItem('propspace_favorites') || '[]');
      setIsFavorite(favorites.includes(data.id));

    } catch (err: any) {
      console.error('Fetch property detail error:', err);
      setError(err.message || 'Unable to retrieve property details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyDetails();
  }, [id, user]);

  const toggleFavorite = () => {
    if (!property) return;
    const favorites = JSON.parse(localStorage.getItem('propspace_favorites') || '[]');
    let newFavs: string[];
    if (isFavorite) {
      newFavs = favorites.filter((fid: string) => fid !== property.id);
    } else {
      newFavs = [...favorites, property.id];
    }
    localStorage.setItem('propspace_favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const handleDelete = async () => {
    if (!property) return;
    if (!window.confirm('Are you absolutely sure you want to delete this listing? (This action cannot be undone)')) {
      return;
    }

    try {
      setLoading(true);
      await api.properties.delete(property.id);
      navigate('/my-listings');
    } catch (err: any) {
      alert(err.message || 'Failed to delete property.');
      setLoading(false);
    }
  };

  const handleContactAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !messageText) {
      alert('Please fill out all required fields.');
      return;
    }

    setSending(true);
    // Simulate API network contact latency
    setTimeout(() => {
      setSending(false);
      setMessageSent(true);
      setMessageText('');
    }, 1200);
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving property records and maps..." fullPage />;
  }

  if (error || !property) {
    return (
      <div className="py-16 px-4" id="detail-error">
        <ErrorMessage 
          message={error || 'Property could not be located in our systems.'} 
          onRetry={fetchPropertyDetails} 
        />
        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to browse listings
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === property.userId;
  const images = property.imageUrls && property.imageUrls.length > 0 
    ? property.imageUrls 
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'];

  const formattedPrice = formatFCFA(property.price);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="property-detail-page">
      {/* Title / Action bar */}
      <div className="bg-white border-b border-gray-100 py-6 mb-8" id="detail-header-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest mb-2.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to listings
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight" id="detail-title">
              {property.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                {property.location.address ? `${property.location.address}, ` : ''}{property.location.city}, {property.location.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                Added {new Date(property.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Owner Actions */}
            {isOwner ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit-property/${property.id}`}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  id="detail-edit-btn"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Listing
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl border border-red-100 transition-colors cursor-pointer"
                  id="detail-delete-btn"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Property
                </button>
              </div>
            ) : (
              <button
                onClick={toggleFavorite}
                className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer ${
                  isFavorite 
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100/70' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                id="detail-fav-btn"
              >
                <Heart className={`h-4.5 w-4.5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Saved to Favorites' : 'Save Property'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Detail Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Details, Images & Description */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery Component */}
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden p-3 shadow-xs" id="detail-gallery">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-950 relative">
                <img
                  src={images[activeImageIndex]}
                  alt={`${property.title} - View ${activeImageIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-full">
                  Image {activeImageIndex + 1} of {images.length}
                </span>
              </div>
              
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === index ? 'border-emerald-600 scale-[0.98]' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={img} alt="Thumbnail view" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* General specs layout */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs space-y-6" id="detail-overview">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    property.status === 'For Sale' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {property.status}
                  </span>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{property.propertyType}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-gray-950">{formattedPrice}</span>
                  {property.status === 'For Rent' && <span className="text-sm font-semibold text-gray-500"> / month</span>}
                </div>
              </div>

              {/* Grid Specifications of property */}
              <div className="grid grid-cols-3 gap-4 text-center py-2 bg-gray-50 rounded-2xl">
                <div className="py-2 border-r border-gray-200">
                  <span className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Bed className="h-5 w-5" /> Beds</span>
                  <span className="text-base font-extrabold text-gray-900">{property.bedrooms ?? '--'}</span>
                </div>
                <div className="py-2 border-r border-gray-200">
                  <span className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Bath className="h-5 w-5" /> Baths</span>
                  <span className="text-base font-extrabold text-gray-900">{property.bathrooms ?? '--'}</span>
                </div>
                <div className="py-2">
                  <span className="flex items-center justify-center gap-1.5 text-gray-400 mb-1"><Maximize2 className="h-5 w-5" /> Area</span>
                  <span className="text-base font-extrabold text-gray-900">{property.area ?? '--'} <span className="text-xs font-normal text-gray-500">m²</span></span>
                </div>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xs" id="detail-description">
              <h3 className="text-lg font-bold text-gray-950 mb-4 border-b border-gray-100 pb-3">
                Property Description
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {property.description}
              </p>
            </div>

          </div>

          {/* Right Columns - Contact Card */}
          <div className="space-y-8">
            
            {/* Agent / Author Bio Card */}
            {property.author && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xs" id="detail-agent-card">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-5">Listing Agent</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    className="h-14 w-14 rounded-full object-cover border border-emerald-100"
                    src={property.author.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(property.author.username)}`}
                    alt={property.author.fullName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=agent';
                    }}
                  />
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-base">{property.author.fullName}</h4>
                    <span className="text-xs text-emerald-600 font-bold">Verified Consultant</span>
                  </div>
                </div>

                {property.author.bio && (
                  <p className="text-xs text-gray-500 italic mb-5 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    "{property.author.bio}"
                  </p>
                )}

                <div className="space-y-2.5 text-xs text-gray-600 border-t border-gray-100 pt-4">
                  {property.author.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-800">{property.author.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-800">{property.author.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Message Agent Inquiry Form */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md" id="detail-inquiry-form">
              <h3 className="font-extrabold text-gray-900 text-sm mb-4">Inquire About This Property</h3>
              
              {messageSent ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center text-emerald-800" id="inquiry-success">
                  <Send className="h-8 w-8 text-emerald-600 mx-auto mb-3 animate-pulse" />
                  <h4 className="font-bold text-sm mb-1">Inquiry Sent Successfully!</h4>
                  <p className="text-xs text-emerald-600">The agent has been notified and will reply back to your email shortly.</p>
                  <button 
                    onClick={() => setMessageSent(false)}
                    className="mt-4 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactAgent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Phone</label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Message</label>
                    <textarea
                      required
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={4}
                      placeholder={`Hello, I am interested in "${property.title}". Please schedule a viewing.`}
                      className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sending ? 'Sending message...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
