import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from './mongodb.js';

const JWT_SECRET = 'your-jwt-secret-key'; // In production, use environment variable
const JWT_EXPIRES_IN = '7d';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  async signUp(email, password, fullName) {
    try {
      const db = getDatabase();
      const users = db.collection('users');

      // Check if user already exists
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = {
        email,
        password: hashedPassword,
        full_name: fullName,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await users.insertOne(newUser);
      
      // Create auth user object
      const authUser = {
        id: result.insertedId.toString(),
        email,
        user_metadata: { full_name: fullName }
      };

      this.currentUser = authUser;
      this.notifyListeners();

      return { data: { user: authUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signIn(email, password) {
    try {
      const db = getDatabase();
      const users = db.collection('users');

      // Find user
      const user = await users.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Create auth user object
      const authUser = {
        id: user._id.toString(),
        email: user.email,
        user_metadata: { full_name: user.full_name }
      };

      this.currentUser = authUser;
      this.notifyListeners();

      return { data: { user: authUser }, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  async signOut() {
    this.currentUser = null;
    this.notifyListeners();
    return { error: null };
  }

  async getUser() {
    return this.currentUser;
  }

  onAuthStateChange(callback) {
    const listener = (user) => {
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
    };
    
    this.listeners.push(listener);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
              this.listeners.splice(index, 1);
            }
          }
        }
      }
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const authService = new AuthService();