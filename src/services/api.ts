import { User, Property, FilterParams } from '../types';

const API_BASE = '/api';

// Centered token storage helper
export function getAuthToken(): string | null {
  return localStorage.getItem('propspace_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('propspace_token', token);
  } else {
    localStorage.removeItem('propspace_token');
  }
}

// Custom Fetch Wrapper implementing the "Global interceptor/API wrapper" guideline
async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}: ${response.statusText}`);
  }

  return data;
}

export const api = {
  auth: {
    async register(formData: any): Promise<{ token: string; user: User }> {
      return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },

    async login(formData: any): Promise<{ token: string; user: User }> {
      return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
    },

    async logout(): Promise<void> {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout API warning:', err);
      } finally {
        setAuthToken(null);
      }
    },

    async verify(): Promise<{ valid: boolean; user: User }> {
      return apiFetch('/auth/verify', { method: 'GET' });
    }
  },

  users: {
    async getProfile(): Promise<User> {
      return apiFetch('/users/profile', { method: 'GET' });
    },

    async updateProfile(profileData: Partial<User>): Promise<{ message: string; user: User }> {
      return apiFetch('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },

    async changePassword(passwordData: any): Promise<{ message: string }> {
      return apiFetch('/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
    }
  },

  properties: {
    async getAll(params: Partial<FilterParams> = {}): Promise<Property[]> {
      const query = new URLSearchParams();
      
      if (params.search) query.append('search', params.search);
      if (params.city) query.append('city', params.city);
      if (params.propertyType && params.propertyType !== 'All') query.append('propertyType', params.propertyType);
      if (params.status && params.status !== 'All') query.append('status', params.status);
      if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
      if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
      if (params.bedrooms !== undefined && params.bedrooms !== null) query.append('bedrooms', String(params.bedrooms));
      if (params.sortBy) query.append('sortBy', params.sortBy);

      const queryString = query.toString();
      return apiFetch(`/properties${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
    },

    async getById(id: string): Promise<Property> {
      return apiFetch(`/properties/${id}`, { method: 'GET' });
    },

    async create(propertyData: any): Promise<{ message: string; property: Property }> {
      return apiFetch('/properties', {
        method: 'POST',
        body: JSON.stringify(propertyData),
      });
    },

    async update(id: string, propertyData: any): Promise<{ message: string; property: Property }> {
      return apiFetch(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(propertyData),
      });
    },

    async delete(id: string): Promise<{ message: string }> {
      return apiFetch(`/properties/${id}`, { method: 'DELETE' });
    },

    async getMyListings(): Promise<Property[]> {
      return apiFetch('/properties/user/listings', { method: 'GET' });
    }
  }
};
