import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { updateUser } from '../services/userService';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateCurrentUser: (updatedInfo: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isCounselor: boolean;
  isStudent: boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  updateCurrentUser: async () => {},
  isAdmin: false,
  isCounselor: false,
  isStudent: false,
  loading: true,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage on initial render
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);  const updateCurrentUser = async (updatedInfo: Partial<User>) => {
    if (user && user.userId) {
      try {
        // Make actual API call to update user in database
        const updatedUserData = { ...user, ...updatedInfo };
        const updatedUser = await updateUser(user.userId, updatedUserData);
        
        // Update local state with the response from backend
        setUser(updatedUser);
        return Promise.resolve();
      } catch (error) {
        console.error('Error updating user in database:', error);
        throw error;
      }
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCounselor = user?.role === 'counselor';
  const isStudent = user?.role === 'student';

  return (
    <UserContext.Provider value={{ user, setUser, updateCurrentUser, isAdmin, isCounselor, isStudent, loading }}>
      {children}
    </UserContext.Provider>
  );
};