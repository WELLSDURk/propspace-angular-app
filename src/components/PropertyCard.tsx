import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Heart, Edit3, Trash2 } from 'lucide-react';
import { Property } from '../types';
import { formatFCFA } from '../utils/format';

interface PropertyCardProps {
  property: Property;
  isOwner?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  isOwner = false,
  onEdit,
  onDelete
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Check and toggle favorite local persistence
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('propspace_favorites') || '[]');
    setIsFavorite(favorites.includes(property.id));
  }, [property.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('propspace_favorites') || '[]');
    let newFavs: string[];
    if (isFavorite) {
      newFavs = favorites.filter((id: string) => id !== property.id);
    } else {
      newFavs = [...favorites, property.id];
    }
    localStorage.setItem('propspace_favorites', JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const formattedPrice = formatFCFA(property.price);

  const mainImage = property.imageUrls?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  return (
    <div 
      className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full relative"
      id={`property-card-${property.id}`}
    >
      {/* Property Status Tag */}
      <span 
        className={`absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
          property.status === 'For Sale' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-indigo-600 text-white'
        }`}
        id={`property-status-${property.id}`}
      >
        {property.status}
      </span>

      {/* Favorite Button (Only if not owner) */}
      {!isOwner && (
        <button
          onClick={toggleFavorite}
          className={`absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-250 hover:scale-110 active:scale-95 ${
            isFavorite 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/85 text-gray-500 hover:text-red-500'
          }`}
          id={`property-fav-btn-${property.id}`}
          aria-label="Toggle favorite"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Property Thumbnail Image */}
      <Link to={`/properties/${property.id}`} className="block overflow-hidden relative aspect-video" id={`property-img-link-${property.id}`}>
        <img
          src={mainImage}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Property Details */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Type & Price Row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">{property.propertyType}</span>
          <span className="text-lg font-extrabold text-gray-950">{formattedPrice}{property.status === 'For Rent' && <span className="text-xs font-normal text-gray-500"> /mo</span>}</span>
        </div>

        {/* Title */}
        <Link to={`/properties/${property.id}`} className="block" id={`property-title-link-${property.id}`}>
          <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 mb-2">
            {property.title}
          </h4>
        </Link>

        {/* Location Row */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-5">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-1">{property.location.city}, {property.location.country}</span>
        </div>

        {/* Property Specifics Grid */}
        <div className="grid grid-cols-3 gap-2 py-3.5 px-4 bg-gray-50 rounded-2xl text-xs text-gray-600 mt-auto">
          <div className="flex items-center gap-1.5 justify-center border-r border-gray-200">
            <Bed className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.bedrooms ?? '--'} <span className="text-gray-400 font-normal">Bds</span></span>
          </div>
          <div className="flex items-center gap-1.5 justify-center border-r border-gray-200">
            <Bath className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.bathrooms ?? '--'} <span className="text-gray-400 font-normal">Ba</span></span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Maximize2 className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{property.area ?? '--'} <span className="text-gray-400 font-normal">m²</span></span>
          </div>
        </div>

        {/* Owner Action Buttons (If Owner Listing) */}
        {isOwner && (onEdit || onDelete) && (
          <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-gray-100" id={`property-owner-actions-${property.id}`}>
            <button
              onClick={() => onEdit?.(property.id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-100 transition-colors"
              id={`property-edit-btn-${property.id}`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => onDelete?.(property.id)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-50 transition-colors"
              id={`property-delete-btn-${property.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
