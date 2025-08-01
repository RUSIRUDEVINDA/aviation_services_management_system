// Mock authentication service

const STORAGE_KEY = 'skyfly_auth';
const TOKEN_KEY = 'skyfly_token';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role?: string; // Added role property
  token?: string; // Added token property
  password?: string; // Added password property
  createdAt?: string; // Added createdAt property for user registration date
}

// Mock user data
const mockUsers: User[] = [
  {
    id: 'U1000',
    name: 'Rusiru Devinda',
    email: 'rusirud49@gmail.com',
    isAdmin: false,
    role: 'user',
    password: 'Rusiru@123', // Added password for validation
  },
  {
    id: 'U1001',
    name: 'Admin',
    email: 'admin@aerox.com',
    isAdmin: true,
    role: 'admin',
    password: 'Admin123', // Added password for validation
  },
];

interface Booking {
  bookingId: string;
  userId: string;
}

const mockBookings: Booking[] = [
  {
    bookingId: 'B1000',
    userId: 'U1000',
  },
  {
    bookingId: 'B1001',
    userId: 'U1001',
  },
];

const getUserBookings = async (userId: string): Promise<Booking[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockBookings.filter(booking => booking.userId === userId);
};

export const login = async (email: string, password: string, bookingId?: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check for empty email or password
  if (!email || !password) {
    return { success: false };
  }
  
  // Find user by email
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    // Validate password - check if it matches the user's password
    if (user.password !== password) {
      return { success: false, message: 'Invalid password' };
    }
    
    // Verify booking ID if provided
    if (bookingId) {
      // In a real application, this would check the database for the booking
      // For now, we'll just verify that the booking ID exists
      const bookingExists = await getUserBookings(user.id).then(bookings => 
        bookings.some(booking => booking.bookingId === bookingId)
      );
      
      if (!bookingExists) {
        return { success: false, message: 'Invalid booking ID' };
      }
    }
    
    // Generate a mock token
    const token = `mock_token_${Math.random().toString(36).substring(2)}`;
    
    // Store token in localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Store user in localStorage with token
    const userWithToken = { ...user, token };
    // Remove password before storing in localStorage for security
    delete userWithToken.password;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
    
    return { success: true, user: userWithToken };
  }
  
  return { success: false, message: 'User not found' };
};

export const register = async (email: string, password: string, name: string): Promise<{ success: boolean; user?: User }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demonstration, accept any valid inputs
  if (!email || !password || !name) {
    return { success: false };
  }
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    return { success: false };
  }
  
  // Create new user (in a real app, this would be stored in a database)
  const newUser: User = {
    id: `U${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    email,
    isAdmin: false,
  };
  
  // Add to mock data (this won't persist between refreshes)
  mockUsers.push(newUser);
  
  return { success: true, user: newUser };
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEY);
};

export const isAdmin = (): boolean => {
  const storedUser = localStorage.getItem(STORAGE_KEY);
  
  if (!storedUser) {
    return false;
  }
  
  try {
    const user = JSON.parse(storedUser) as User;
    return user.isAdmin;
  } catch {
    return false;
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Function to decode QR data
export const decodeQRData = (qrData: string): any | null => {
  if (qrData.startsWith('AIRWAVE:')) {
    try {
      const jsonData = qrData.substring(8); // Remove "AIRWAVE:" prefix
      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error decoding QR data:', error);
      return null;
    }
  }
  return null;
};
