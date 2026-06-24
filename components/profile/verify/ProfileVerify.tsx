"use client";

import React from "react";
import { ProfileVerifyProvider } from "./ProfileVerifyContext";
import { ProfileVerifyHeader } from "./ProfileVerifyHeader";
import { ProfileVerifyCamera } from "./ProfileVerifyCamera";
import { ProfileVerifyActions } from "./ProfileVerifyActions";

export function ProfileVerify() {
  return (
    <ProfileVerifyProvider>
      <div className="min-h-dvh flex flex-col bg-white">
        <ProfileVerifyHeader />
        <ProfileVerifyCamera />
        <ProfileVerifyActions />
      </div>
    </ProfileVerifyProvider>
  );
}
