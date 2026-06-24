import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building, MapPin, Coins, List, Edit3, Plus, Trash, 
  ArrowLeft, AlertTriangle, Upload, Image as ImageIcon, HelpCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If has ID, we are in Edit mode
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<'Apartment' | 'House' | 'Studio' | 'Villa' | 'Commercial'>('Apartment');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'For Rent' | 'For Sale'>('For Sale');

  // Form status state
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load existing property data if in edit mode
  useEffect(() => {
    const loadProperty = async () => {
      if (!isEditMode || !id) return;
      try {
        setFetchingProperty(true);
        setError(null);
        const data = await api.properties.getById(id);
        
        // Ownership check
        if (data.userId !== user?.id) {
          setError('Unauthorized: You do not own this listing.');
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setPrice(String(data.price));
        setCity(data.location.city);
        setCountry(data.location.country);
        setAddress(data.location.address || '');
        setPropertyType(data.propertyType);
        setBedrooms(data.bedrooms !== undefined ? String(data.bedrooms) : '');
        setBathrooms(data.bathrooms !== undefined ? String(data.bathrooms) : '');
        setArea(data.area !== undefined ? String(data.area) : '');
        setImageUrls(data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : ['']);
        setStatus(data.status);

      } catch (err: any) {
        console.error('Load property for edit error:', err);
        setError(err.message || 'Failed to load property data for editing.');
      } finally {
        setFetchingProperty(false);
      }
    };

    if (user && isEditMode) {
      loadProperty();
    }
  }, [id, isEditMode, user]);

  // Handle URL change
  const handleImageUrlChange = (index: number, val: string) => {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  };

  // Add URL field
  const addImageUrlField = () => {
    if (imageUrls.length >= 5) {
      alert('You can list up to 5 image URLs maximum.');
      return;
    }
    setImageUrls([...imageUrls, '']);
  };

  // Remove URL field
  const removeImageUrlField = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
      return;
    }
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
  };

  const handleFiles = (files: FileList) => {
    const cleanCurrent = imageUrls.filter(url => url.trim() !== '');
    if (cleanCurrent.length + files.length > 5) {
      alert('You can upload up to 5 images maximum.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('File must be an image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Str = reader.result;
          setImageUrls(prev => {
            const clean = prev.filter(url => url.trim() !== '');
            if (clean.length < 5) {
              return [...clean, base64Str];
            }
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Inputs Validation
    if (!title.trim() || !description.trim() || !price || !city.trim() || !country.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    if (title.trim().length > 100) {
      setError('Title cannot exceed 100 characters.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    if (description.trim().length > 2000) {
      setError('Description cannot exceed 2000 characters.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    const areaNum = area ? parseFloat(area) : undefined;
    if (area && (isNaN(areaNum!) || areaNum! <= 0)) {
      setError('Area must be a positive number.');
      return;
    }

    // Clean image URLs (remove empty values)
    const cleanedImageUrls = imageUrls
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
      location: {
        city: city.trim(),
        country: country.trim(),
        address: address.trim() || undefined
      },
      propertyType,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
      area: areaNum,
      imageUrls: cleanedImageUrls.length > 0 ? cleanedImageUrls : undefined,
      status
    };

    try {
      setLoading(true);
      if (isEditMode && id) {
        await api.properties.update(id, payload);
        navigate(`/properties/${id}`);
      } else {
        const res = await api.properties.create(payload);
        navigate(`/properties/${res.property.id}`);
      }
    } catch (err: any) {
      console.error('Submit property form error:', err);
      setError(err.message || 'Failed to submit property listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProperty) {
    return <LoadingSpinner message="Pulling listing registry details..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="property-form-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation Link */}
        <div className="mb-6">
          <Link to={isEditMode ? `/properties/${id}` : '/'} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-100 pb-6 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight flex items-center gap-2">
                <Building className="h-7 w-7 text-emerald-600" />
                {isEditMode ? 'Edit Property Listing' : 'Publish New Property'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode ? 'Modify details for your current property listing' : 'Provide property specifics to publish to our global buyers feed'}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex gap-2.5 items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6" id="form-error-banner">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Luxury 3-Bedroom Oceanfront Villa"
                className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-semibold"
                id="form-title"
              />
              <span className="text-[10px] text-gray-400 mt-1 block text-right font-medium">
                {title.length}/100 characters max
              </span>
            </div>

            {/* 2. Status & Property Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Offer Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Offer Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStatus('For Sale')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      status === 'For Sale'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    For Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('For Rent')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      status === 'For Rent'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    For Rent
                  </button>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as any)}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-2xl text-sm outline-hidden text-gray-900 font-semibold"
                  id="form-property-type"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>

            {/* 3. Price & Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Price */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Price (FCFA) <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-2xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Coins className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 45000000"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                    id="form-price"
                  />
                </div>
                {status === 'For Rent' && (
                  <span className="text-[10px] text-gray-400 mt-1 block">Monthly rent price</span>
                )}
              </div>

              {/* Area */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Area (m²) <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., 120"
                  className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  id="form-area"
                />
              </div>
            </div>

            {/* 4. Bedrooms & Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Bedrooms <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="e.g., 3"
                  className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  id="form-bedrooms"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Bathrooms <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="e.g., 2"
                  className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  id="form-bathrooms"
                />
              </div>
            </div>

            {/* 5. Location details */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1 mb-2">
                <MapPin className="h-4 w-4" /> Location Details
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Los Angeles"
                    className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 font-semibold"
                    id="form-city"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., United States"
                    className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 font-semibold"
                    id="form-country"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 405 Hilgard Ave"
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900 font-semibold"
                  id="form-address"
                />
              </div>
            </div>

            {/* 6. Property Images (Dual Local Upload & Remote URL) */}
            <div className="space-y-4 pt-3 border-t border-gray-100" id="property-photos-block">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Property Photos <span className="text-gray-400 font-normal">(Local Upload OR Direct URL, up to 5 total)</span>
                </label>
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer"
                  id="add-image-url-btn"
                >
                  <Plus className="h-3 w-3 stroke-[3]" /> Add URL Row
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-input')?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-emerald-400'
                }`}
                id="photo-drag-drop-zone"
              >
                <input
                  type="file"
                  id="file-upload-input"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                />
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                <p className="text-xs font-bold text-gray-700 text-center">
                  Drag & drop property images here
                </p>
                <p className="text-[10px] text-gray-400 mt-1 text-center font-semibold">
                  Or click to browse files on your computer
                </p>
              </div>

              {/* Previews and URL List */}
              {imageUrls.length > 0 && (
                <div className="space-y-3" id="image-previews-list">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
                    Current Images ({imageUrls.filter(u => u.trim() !== '').length} / 5)
                  </span>
                  <div className="grid grid-cols-1 gap-3.5">
                    {imageUrls.map((url, index) => {
                      const isBase64 = url.startsWith('data:image/');
                      return (
                        <div 
                          key={index} 
                          className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-xs"
                        >
                          {/* Mini Thumbnail */}
                          <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                            {url.trim() ? (
                              <img 
                                src={url} 
                                alt={`Property ${index + 1}`} 
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=150&q=80';
                                }}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          {/* Image type and URL Input */}
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                              Image {index + 1} {isBase64 ? '• Uploaded File' : '• Web URL'}
                            </span>
                            {isBase64 ? (
                              <div className="text-[11px] font-mono text-gray-500 truncate bg-gray-50/50 py-1 px-2.5 rounded-lg border border-gray-100">
                                Local image file uploaded successfully
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                </div>
                                <input
                                  type="url"
                                  value={url}
                                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                  placeholder="Paste a direct image link (e.g. https://unsplash.com/...)"
                                  className="block w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                                />
                              </div>
                            )}
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => removeImageUrlField(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer self-center"
                            title="Remove image"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
                Protip: Drop local image files (.jpg, .png, etc.) directly, or paste standard Unsplash / web image links.
              </span>
            </div>

            {/* 7. Description */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                minLength={20}
                maxLength={2000}
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give a deep overview of the listing, highlighting key features, transport links, community atmosphere, amenities..."
                className="block w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                id="form-description"
              />
              <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400 font-medium">
                <span>Minimum 20 characters required</span>
                <span>{description.length}/2000 characters</span>
              </div>
            </div>

            {/* Submit Action Block */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-8"
              id="form-submit-btn"
            >
              {loading ? 'Submitting Registry Listing...' : isEditMode ? 'Update Property Listing' : 'Publish Property Listing'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};
