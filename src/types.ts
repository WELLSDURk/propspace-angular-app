export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    country: string;
    address?: string;
  };
  propertyType: 'Apartment' | 'House' | 'Studio' | 'Villa' | 'Commercial';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrls: string[];
  status: 'For Rent' | 'For Sale';
  userId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  author?: {
    username: string;
    fullName: string;
    avatarUrl?: string;
    phoneNumber?: string;
    email: string;
    bio?: string;
  } | null;
}

export interface FilterParams {
  search: string;
  city: string;
  propertyType: string;
  status: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sortBy: string;
}
