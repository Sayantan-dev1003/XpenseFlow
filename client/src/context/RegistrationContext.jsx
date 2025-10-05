import React, { createContext, useContext, useState } from 'react';

const RegistrationContext = createContext();

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};

export const RegistrationProvider = ({ children }) => {
  const [registrationData, setRegistrationData] = useState({
    // Admin Details (Step 1)
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
    
    // Company Details (Step 2)
    companyName: '',
    address: {
      area: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    industry: '',
    baseCurrency: {
      code: '',
      name: '',
      symbol: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const updateRegistrationData = (stepData) => {
    setRegistrationData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <RegistrationContext.Provider
      value={{
        registrationData,
        updateRegistrationData,
        currentStep,
        nextStep,
        prevStep,
        isLoading,
        setIsLoading,
        error,
        setError,
        userId,
        setUserId
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationProvider;