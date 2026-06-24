import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  denomination: string;
  church: string;
  church_verified: boolean;
  feconecta_verified: boolean;
  bio: string;
  testimony_type: "audio" | "video";
  faith_importance: number;
  looking_for: string;
  photos: string[];
  gradient: string;
  emoji: string;
}

interface ProfileCardContextType {
  profile: Profile;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  swipeDir: "left" | "right" | null;
  showOrarAnim: boolean;
  handlePass: () => void;
  handleOrar: () => void;
  handleSuper: () => void;
}

export const ProfileCardContext = createContext<ProfileCardContextType | null>(null);

export const useProfileCard = () => {
  const context = useContext(ProfileCardContext);
  if (!context) throw new Error("useProfileCard must be used within a ProfileCardProvider");
  return context;
};

export const LOOKING_FOR_LABELS: Record<string, string> = {
  marriage: "Casamento",
  relationship: "Relacionamento sério",
  friendship: "Amizade primeiro",
  undecided: "Deixando Deus guiar",
};
