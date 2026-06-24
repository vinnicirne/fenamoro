"use client";

import React from "react";
import { ProfileEditProvider } from "./ProfileEditContext";
import { ProfileEditHeader } from "./ProfileEditHeader";
import { ProfileEditForm } from "./ProfileEditForm";
import { ProfileEditActions } from "./ProfileEditActions";

export function ProfileEdit() {
  return (
    <ProfileEditProvider>
      <div className="min-h-dvh flex flex-col bg-white">
        <ProfileEditHeader />
        <ProfileEditForm />
        <ProfileEditActions />
      </div>
    </ProfileEditProvider>
  );
}
