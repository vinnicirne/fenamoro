"use client";

import React from "react";
import { ProfilePremiumProvider } from "./ProfilePremiumContext";
import { ProfilePremiumHeader } from "./ProfilePremiumHeader";
import { ProfilePremiumBenefits } from "./ProfilePremiumBenefits";
import { ProfilePremiumPlans } from "./ProfilePremiumPlans";
import { ProfilePremiumActions } from "./ProfilePremiumActions";

export function ProfilePremium() {
  return (
    <ProfilePremiumProvider>
      <div className="min-h-dvh flex flex-col bg-[#F0F2F5] relative">
        <ProfilePremiumHeader />
        <ProfilePremiumBenefits />
        <ProfilePremiumPlans />
        <ProfilePremiumActions />
      </div>
    </ProfilePremiumProvider>
  );
}
