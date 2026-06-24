"use client";

import React from "react";
import { ProfileTestimonyProvider, useProfileTestimony } from "./ProfileTestimonyContext";
import { ProfileTestimonyHeader } from "./ProfileTestimonyHeader";
import { ProfileTestimonyAudio } from "./ProfileTestimonyAudio";
import { ProfileTestimonyVideo } from "./ProfileTestimonyVideo";
import { ProfileTestimonyActions } from "./ProfileTestimonyActions";

function TestimonyContent() {
  const { mediaType } = useProfileTestimony();
  
  return (
    <div className="flex-1 flex flex-col relative bg-gray-50">
      {mediaType === "audio" ? <ProfileTestimonyAudio /> : <ProfileTestimonyVideo />}
    </div>
  );
}

export function ProfileTestimony() {
  return (
    <ProfileTestimonyProvider>
      <div className="min-h-dvh flex flex-col bg-white">
        <ProfileTestimonyHeader />
        <TestimonyContent />
        <ProfileTestimonyActions />
      </div>
    </ProfileTestimonyProvider>
  );
}
