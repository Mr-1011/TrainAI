import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { passportService } from "@/services/passport.service";
import type { Passport, CreatePassportRequest } from "@/types/passport";

interface PassportContextType {
  passports: Passport[];
  isLoading: boolean;
  currentPassport: Passport | null;
  createPassport: (data: CreatePassportRequest) => Promise<Passport>;
  fetchPassports: () => Promise<void>;
  selectPassport: (passport: Passport | null) => void;
}

const PassportContext = createContext<PassportContextType | undefined>(undefined);

interface PassportProviderProps {
  children: ReactNode;
}

export const PassportProvider: React.FC<PassportProviderProps> = ({ children }) => {
  const [passports, setPassports] = useState<Passport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassport, setCurrentPassport] = useState<Passport | null>(null);

  const createPassport = useCallback(async (data: CreatePassportRequest): Promise<Passport> => {
    setIsLoading(true);
    try {
      const passport = await passportService.createPassport(data);
      setPassports((prev) => [...prev, passport]);
      setCurrentPassport(passport);
      return passport;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPassports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await passportService.getPassports();
      setPassports(data);
    } catch (error) {
      console.error("Error fetching passports:", error);
      setPassports([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectPassport = useCallback((passport: Passport | null) => {
    setCurrentPassport(passport);
  }, []);

  const value: PassportContextType = {
    passports,
    isLoading,
    currentPassport,
    createPassport,
    fetchPassports,
    selectPassport,
  };

  return <PassportContext.Provider value={value}>{children}</PassportContext.Provider>;
};

export const usePassport = () => {
  const context = useContext(PassportContext);
  if (context === undefined) {
    throw new Error("usePassport must be used within a PassportProvider");
  }
  return context;
};
