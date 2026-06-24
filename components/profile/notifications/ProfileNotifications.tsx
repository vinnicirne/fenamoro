"use client";

import React from "react";
import { ProfileNotificationsProvider } from "./ProfileNotificationsContext";
import { ProfileNotificationsHeader } from "./ProfileNotificationsHeader";
import { ProfileNotificationsForm } from "./ProfileNotificationsForm";
import { ProfileNotificationsActions } from "./ProfileNotificationsActions";

export function ProfileNotifications() {
  return (
    <ProfileNotificationsProvider>
      <div className="h-dvh flex flex-col bg-white">
        <ProfileNotificationsHeader />
        <ProfileNotificationsForm />
        <ProfileNotificationsActions />
      </div>
    </ProfileNotificationsProvider>
  );
}
