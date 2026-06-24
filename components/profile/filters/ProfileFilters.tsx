"use client";

import React from "react";
import { ProfileFiltersProvider } from "./ProfileFiltersContext";
import { ProfileFiltersHeader } from "./ProfileFiltersHeader";
import { ProfileFiltersForm } from "./ProfileFiltersForm";
import { ProfileFiltersActions } from "./ProfileFiltersActions";

export function ProfileFilters() {
  return (
    <ProfileFiltersProvider>
      <div className="h-dvh flex flex-col bg-white">
        <ProfileFiltersHeader />
        <ProfileFiltersForm />
        <ProfileFiltersActions />
      </div>
    </ProfileFiltersProvider>
  );
}
