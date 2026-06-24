import { Request, Response } from 'express';
import crypto from 'crypto';
import { getProperties, saveProperties, getUsers, Property } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

function generateId(): string {
  return crypto.randomUUID();
}

export function getAllProperties(req: Request, res: Response) {
  try {
    const properties = getProperties().filter(p => !p.isDeleted);
    const users = getUsers();

    // Query parameters for search & filter
    const search = req.query.search as string;
    const city = req.query.city as string;
    const propertyType = req.query.propertyType as string;
    const status = req.query.status as string; // 'For Rent' | 'For Sale'
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const bedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms as string, 10) : undefined;
    const sortBy = req.query.sortBy as string; // 'price_asc' | 'price_desc' | 'date_added' | 'area_desc'

    let filtered = [...properties];

    // Filter by search (title / description / city / country)
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.location.city.toLowerCase().includes(q) ||
        p.location.country.toLowerCase().includes(q)
      );
    }

    // Filter by city
    if (city && city.trim() !== '') {
      const c = city.toLowerCase().trim();
      filtered = filtered.filter(p => p.location.city.toLowerCase() === c);
    }

    // Filter by propertyType
    if (propertyType && propertyType !== 'All') {
      filtered = filtered.filter(p => p.propertyType === propertyType);
    }

    // Filter by status (Rent/Sale)
    if (status && status !== 'All') {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filter by minPrice
    if (minPrice !== undefined && !isNaN(minPrice)) {
      filtered = filtered.filter(p => p.price >= minPrice);
    }

    // Filter by maxPrice
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      filtered = filtered.filter(p => p.price <= maxPrice);
    }

    // Filter by bedrooms
    if (bedrooms !== undefined && !isNaN(bedrooms)) {
      filtered = filtered.filter(p => p.bedrooms === bedrooms);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'area_desc') {
      filtered.sort((a, b) => (b.area || 0) - (a.area || 0));
    } else {
      // Default: date_added (newest first)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Attach minimal user (author) profile info for each property
    const responseData = filtered.map(p => {
      const author = users.find(u => u.id === p.userId);
      return {
        ...p,
        author: author ? {
          username: author.username,
          fullName: author.fullName,
          avatarUrl: author.avatarUrl,
          phoneNumber: author.phoneNumber,
          email: author.email
        } : null
      };
    });

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Get properties error:', error);
    return res.status(500).json({ error: 'Internal server error fetching properties.' });
  }
}

export function getPropertyById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const properties = getProperties();
    const property = properties.find(p => p.id === id && !p.isDeleted);

    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const users = getUsers();
    const author = users.find(u => u.id === property.userId);

    const responseData = {
      ...property,
      author: author ? {
        username: author.username,
        fullName: author.fullName,
        avatarUrl: author.avatarUrl,
        phoneNumber: author.phoneNumber,
        email: author.email,
        bio: author.bio
      } : null
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Get property by ID error:', error);
    return res.status(500).json({ error: 'Internal server error fetching property details.' });
  }
}

export function createProperty(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { 
      title, 
      description, 
      price, 
      location, 
      propertyType, 
      bedrooms, 
      bathrooms, 
      area, 
      imageUrls, 
      status 
    } = req.body;

    const properties = getProperties();
    const now = new Date().toISOString();

    const newProperty: Property = {
      id: generateId(),
      title,
      description,
      price,
      location: {
        city: location.city,
        country: location.country,
        address: location.address || ''
      },
      propertyType,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
      area: area ? parseFloat(area) : undefined,
      imageUrls: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'],
      status,
      userId: req.user.id,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    };

    properties.push(newProperty);
    saveProperties(properties);

    return res.status(201).json({
      message: 'Property listing created successfully.',
      property: newProperty
    });
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ error: 'Internal server error creating property.' });
  }
}

export function updateProperty(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const properties = getProperties();
    const propertyIndex = properties.findIndex(p => p.id === id && !p.isDeleted);

    if (propertyIndex === -1) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const property = properties[propertyIndex];

    // Ownership check
    if (property.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this property listing.' });
    }

    const { 
      title, 
      description, 
      price, 
      location, 
      propertyType, 
      bedrooms, 
      bathrooms, 
      area, 
      imageUrls, 
      status 
    } = req.body;

    const updatedProperty: Property = {
      ...property,
      title: title || property.title,
      description: description || property.description,
      price: price !== undefined ? price : property.price,
      location: location ? {
        city: location.city || property.location.city,
        country: location.country || property.location.country,
        address: location.address !== undefined ? location.address : property.location.address
      } : property.location,
      propertyType: propertyType || property.propertyType,
      bedrooms: bedrooms !== undefined ? parseInt(bedrooms, 10) : property.bedrooms,
      bathrooms: bathrooms !== undefined ? parseInt(bathrooms, 10) : property.bathrooms,
      area: area !== undefined ? parseFloat(area) : property.area,
      imageUrls: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : property.imageUrls,
      status: status || property.status,
      updatedAt: new Date().toISOString()
    };

    properties[propertyIndex] = updatedProperty;
    saveProperties(properties);

    return res.status(200).json({
      message: 'Property listing updated successfully.',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Update property error:', error);
    return res.status(500).json({ error: 'Internal server error updating property.' });
  }
}

export function deleteProperty(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { id } = req.params;
    const properties = getProperties();
    const propertyIndex = properties.findIndex(p => p.id === id && !p.isDeleted);

    if (propertyIndex === -1) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const property = properties[propertyIndex];

    // Ownership check
    if (property.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this property listing.' });
    }

    // Soft delete
    property.isDeleted = true;
    property.updatedAt = new Date().toISOString();
    
    properties[propertyIndex] = property;
    saveProperties(properties);

    return res.status(200).json({ message: 'Property listing deleted successfully (soft-delete).' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ error: 'Internal server error deleting property.' });
  }
}

export function getUserProperties(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const properties = getProperties().filter(p => p.userId === req.user!.id && !p.isDeleted);
    return res.status(200).json(properties);
  } catch (error) {
    console.error('Get user properties error:', error);
    return res.status(500).json({ error: 'Internal server error fetching your listings.' });
  }
}
