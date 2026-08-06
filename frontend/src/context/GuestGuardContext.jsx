import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const GuestGuardContext = createContext();

export const GuestGuardProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionName, setActionName] = useState('');

  const requireAuth = (callback, featureName = 'perform this action') => {
    if (isAuthenticated) {
      if (callback) callback();
      return true;
    } else {
      setActionName(featureName);
      setIsModalOpen(true);
      return false;
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionName('');
  };

  return (
    <GuestGuardContext.Provider value={{ requireAuth, isModalOpen, actionName, closeModal }}>
      {children}
    </GuestGuardContext.Provider>
  );
};

export const useGuestGuard = () => useContext(GuestGuardContext);
