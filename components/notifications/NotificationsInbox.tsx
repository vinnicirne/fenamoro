"use client";

import React from "react";
import { NotificationsProvider } from "./NotificationsContext";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationList } from "./NotificationList";

export function NotificationsInbox() {
  return (
    <NotificationsProvider>
      <div className="h-dvh flex flex-col bg-[#F0F2F5]">
        <NotificationsHeader />
        <NotificationList />
      </div>
    </NotificationsProvider>
  );
}
