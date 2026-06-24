import React, { useState } from "react";
import { ProfileCardContext } from "./ProfileCardContext";
import ProfileCardMedia from "./ProfileCardMedia";
import ProfileCardInfo from "./ProfileCardInfo";
import ProfileCardActions from "./ProfileCardActions";

export default function ProfileCard({ profile, nextProfile, showOrarAnim, setShowOrarAnim, onOrar, onPass }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  const handlePass = () => {
    setSwipeDir("left");
    if (onPass) onPass(profile.id);
    setTimeout(() => {
      setSwipeDir(null);
      setIsPlaying(false);
      nextProfile();
    }, 300);
  };

  const handleOrar = () => {
    setShowOrarAnim(true);
    if (onOrar) onOrar(profile.id, false);
    setTimeout(() => {
      setShowOrarAnim(false);
      setSwipeDir("right");
      setTimeout(() => {
        setSwipeDir(null);
        setIsPlaying(false);
        nextProfile();
      }, 300);
    }, 600);
  };

  const handleSuper = () => {
    setSwipeDir("right");
    if (onOrar) onOrar(profile.id, true);
    setTimeout(() => {
      setSwipeDir(null);
      setIsPlaying(false);
      nextProfile();
    }, 300);
  };

  return (
    <ProfileCardContext.Provider value={{
      profile, isPlaying, setIsPlaying, swipeDir, showOrarAnim, handlePass, handleOrar, handleSuper
    }}>
      <div
        className={`w-full max-w-sm rounded-4xl overflow-hidden shadow-card transition-all duration-300 ${
          swipeDir === "left" ? "-translate-x-full opacity-0 rotate-[-10deg]" :
          swipeDir === "right" ? "translate-x-full opacity-0 rotate-[10deg]" : ""
        }`}
        style={{ background: "white" }}
      >
        <ProfileCardMedia />
        <ProfileCardInfo />
        <ProfileCardActions />
      </div>
    </ProfileCardContext.Provider>
  );
}
