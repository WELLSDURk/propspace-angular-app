import fs from 'fs';
import path from 'path';

// Define the absolute storage directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// Interface declarations
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
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
}

// Ensure the storage directory and files exist
export function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUser: User = {
      id: "agent-1",
      username: "sarah_agent",
      email: "sarah@propspace.com",
      // pre-hashed "Propspace2026!"
      passwordHash: "$2a$10$f66I8xJz3ClyzIlyb28Biuo9W63u6tqW877mYj368b6l2I/ZqS1B.", 
      fullName: "Sarah Jenkins",
      phoneNumber: "+1 (555) 321-4567",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah",
      bio: "Premier Real Estate Agent with over 8 years of luxury residential sales experience. Committed to finding your perfect home.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultUser], null, 2), 'utf-8');
  }

  if (!fs.existsSync(PROPERTIES_FILE) || fs.readFileSync(PROPERTIES_FILE, 'utf-8') === '[]') {
    const defaultProperties: Property[] = [
      {
        id: "prop-1",
        title: "Luxury Villa in Bastos (Diplomatic Quarter)",
        description: "Exquisite 5-bedroom villa located in the highly secure and prestigious Bastos neighborhood in Yaoundé. This architectural masterpiece features modern African interior design, a beautiful swimming pool, lush gardens, high-end security, and an expansive terrace overlooking the hills.",
        price: 450000000,
        location: {
          city: "Yaoundé",
          country: "Cameroon",
          address: "Rue de Bastos"
        },
        propertyType: "Villa",
        bedrooms: 5,
        bathrooms: 6,
        area: 450,
        imageUrls: [
          "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-2",
        title: "Modern 2-Bedroom Apartment in Bonapriso",
        description: "Clean, upscale 2-bedroom apartment situated in the serene and trendy neighborhood of Bonapriso, Douala. Fully furnished with contemporary luxury furniture, a fully equipped chef's kitchen, high-speed fiber internet, and backup generator/water storage facilities.",
        price: 1200000,
        location: {
          city: "Douala",
          country: "Cameroon",
          address: "Rue de Bonapriso"
        },
        propertyType: "Apartment",
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        imageUrls: [
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-3",
        title: "Stunning Oceanfront Penthouse in Kribi",
        description: "Escape to paradise in this luxurious 3-bedroom oceanfront apartment on the beautiful sandy beaches of Kribi. Features a massive balcony with panoramic views of the Atlantic Ocean, modern open-plan living, private beach access, and 24/7 security. Perfect as a vacation home or high-yielding rental.",
        price: 180000000,
        location: {
          city: "Kribi",
          country: "Cameroon",
          address: "Plage de Kribi"
        },
        propertyType: "Apartment",
        bedrooms: 3,
        bathrooms: 3,
        area: 210,
        imageUrls: [
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-4",
        title: "Premium Commercial Office Building in Akwa",
        description: "Prime commercial office space located in the bustling business district of Akwa, Douala. Ideal for corporate headquarters, banks, or tech hubs. Boasts multiple glass-walled conference rooms, modular office spaces, high-speed elevators, and secure private parking for up to 15 vehicles.",
        price: 3500000,
        location: {
          city: "Douala",
          country: "Cameroon",
          address: "Boulevard de la Liberté"
        },
        propertyType: "Commercial",
        bedrooms: 0,
        bathrooms: 4,
        area: 320,
        imageUrls: [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-5",
        title: "Charming Family Home near Botanical Garden",
        description: "Beautiful 4-bedroom family home located near the peaceful Botanical Garden in Limbe. Offers scenic mountain views of Mount Cameroon, a spacious courtyard garden with mango and avocado trees, a large secure parking garage, and a modern open kitchen.",
        price: 85000000,
        location: {
          city: "Limbe",
          country: "Cameroon",
          address: "Garden Road"
        },
        propertyType: "House",
        bedrooms: 4,
        bathrooms: 3,
        area: 185,
        imageUrls: [
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 96).toISOString(), // 4 days ago
        updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-6",
        title: "Cozy Student Studio Apartment in Molyko",
        description: "Cozy, fully tiled studio apartment located in the lively student district of Molyko, Buea, within walking distance to the university campus. Features a private kitchen corner, constant water flow from a private borehole system, and an individual Enéo prepaid electricity meter.",
        price: 75000,
        location: {
          city: "Buea",
          country: "Cameroon",
          address: "Molyko Road"
        },
        propertyType: "Studio",
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 120).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-7",
        title: "Industrial Storage Warehouse in Bassa Zone",
        description: "Spacious 1,200 sqm concrete-floored industrial warehouse in the busy Bassa Industrial Zone, Douala. Designed for logistics or manufacturing with high roof clearance, secure loading bays for large trucks, 3-phase heavy-duty electricity supply, and 24/7 security guardhouse.",
        price: 2500000,
        location: {
          city: "Douala",
          country: "Cameroon",
          address: "Zone Industrielle de Bassa"
        },
        propertyType: "Commercial",
        bedrooms: 0,
        bathrooms: 2,
        area: 1200,
        imageUrls: [
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 144).toISOString(), // 6 days ago
        updatedAt: new Date(Date.now() - 3600000 * 144).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-8",
        title: "Standard 3-Bedroom Apartment in Santa Barbara",
        description: "Nicely finished 3-bedroom residential apartment in the calm Santa Barbara neighborhood of Yaoundé. Large airy living room with street-facing balcony, tiled kitchen counter, fitted wardrobes, secured metal window grills, and active water heating systems.",
        price: 350000,
        location: {
          city: "Yaoundé",
          country: "Cameroon",
          address: "Santa Barbara Hill"
        },
        propertyType: "Apartment",
        bedrooms: 3,
        bathrooms: 2,
        area: 160,
        imageUrls: [
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 168).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 3600000 * 168).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-9",
        title: "Elegant 4-Bedroom Duplex in Denver Area",
        description: "Modern, high-end 4-bedroom family duplex in Denver, Douala. Includes master suite with walk-in closet and hot tub, broad marble-tiled dining room, fenced yard with green lawn, parking carport for 3 vehicles, and fully paved security courtyard.",
        price: 150000000,
        location: {
          city: "Douala",
          country: "Cameroon",
          address: "Denver Residential Street"
        },
        propertyType: "House",
        bedrooms: 4,
        bathrooms: 4,
        area: 280,
        imageUrls: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 192).toISOString(), // 8 days ago
        updatedAt: new Date(Date.now() - 3600000 * 192).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-10",
        title: "Beachside Holiday Guesthouse in Ngoyè",
        description: "Beautifully maintained 3-bedroom guesthouse bungalow located in Ngoyè, Kribi, situated steps away from the soft ocean sand. Fully furnished, features an outdoor patio with ocean breeze views, coconut trees yard, and perfect suitability for holiday listings or direct residency.",
        price: 120000000,
        location: {
          city: "Kribi",
          country: "Cameroon",
          address: "Ngoyè Beach Road"
        },
        propertyType: "House",
        bedrooms: 3,
        bathrooms: 2,
        area: 175,
        imageUrls: [
          "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 216).toISOString(), // 9 days ago
        updatedAt: new Date(Date.now() - 3600000 * 216).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-11",
        title: "Exclusive 5-Bedroom Executive Duplex in Golf",
        description: "Prestigious 5-bedroom luxury duplex situated in the secure, high-end Golf neighborhood of Yaoundé. Perfect for foreign diplomats, corporate executives, or elite families. Boasts high-ceiling living halls, private backup solar power systems, high security with armed response readiness, and pristine green views of the neighboring Golf Course.",
        price: 380000000,
        location: {
          city: "Yaoundé",
          country: "Cameroon",
          address: "Golf Club District"
        },
        propertyType: "House",
        bedrooms: 5,
        bathrooms: 5,
        area: 400,
        imageUrls: [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 240).toISOString(), // 10 days ago
        updatedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-12",
        title: "Modern 3-Bedroom Apartment in Bonamoussadi",
        description: "Lovely, well-lit 3-bedroom apartment located in the vibrant and family-friendly residential hub of Bonamoussadi, Douala. Fully secured gated compound, tiled floors throughout, modern kitchen cabinets, private backup water supply with 5000L tank capacity, and balconies overlooking the neighborhood.",
        price: 250000,
        location: {
          city: "Douala",
          country: "Cameroon",
          address: "Rond-point Bonamoussadi"
        },
        propertyType: "Apartment",
        bedrooms: 3,
        bathrooms: 2,
        area: 150,
        imageUrls: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Rent",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 264).toISOString(), // 11 days ago
        updatedAt: new Date(Date.now() - 3600000 * 264).toISOString(),
        isDeleted: false
      },
      {
        id: "prop-13",
        title: "Charming 3-Bedroom Residential Villa in Odza",
        description: "Spacious, securely walled 3-bedroom standalone villa situated in Odza, Yaoundé. Features a spacious parking area for up to 4 cars, a lovely front terrace, an outdoor kitchen/barbecue area, high perimeter walls with concertina wire fencing, and consistent utility supply. Great for a comfortable, quiet family lifestyle.",
        price: 95000000,
        location: {
          city: "Yaoundé",
          country: "Cameroon",
          address: "Odza Messassi"
        },
        propertyType: "Villa",
        bedrooms: 3,
        bathrooms: 3,
        area: 220,
        imageUrls: [
          "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
        ],
        status: "For Sale",
        userId: "agent-1",
        createdAt: new Date(Date.now() - 3600000 * 288).toISOString(), // 12 days ago
        updatedAt: new Date(Date.now() - 3600000 * 288).toISOString(),
        isDeleted: false
      }
    ];
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(defaultProperties, null, 2), 'utf-8');
  }
}

// Users Database Operations
export function getUsers(): User[] {
  try {
    initDatabase();
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
}

export function saveUsers(users: User[]): void {
  try {
    initDatabase();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users database:', err);
  }
}

// Properties Database Operations
export function getProperties(): Property[] {
  try {
    initDatabase();
    const data = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading properties database:', err);
    return [];
  }
}

export function saveProperties(properties: Property[]): void {
  try {
    initDatabase();
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing properties database:', err);
  }
}
