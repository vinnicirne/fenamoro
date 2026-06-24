import React from "react";
import { useProfileCard, LOOKING_FOR_LABELS } from "./ProfileCardContext";

export default function ProfileCardInfo() {
  const { profile } = useProfileCard();

  return (
    <>
      {/* Bio */}
      <div className="px-4 py-2">
        <p className="text-gray-600 text-sm font-manrope leading-relaxed">
          "{profile.bio}"
        </p>
      </div>

      {/* Tags */}
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-jakarta font-medium"
          style={{ background: "rgba(7,94,84,0.08)", color: "#075E54" }}>
          🏛️ {profile.church}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-jakarta font-medium"
          style={{ background: "rgba(37,211,102,0.08)", color: "#128C7E" }}>
          💍 {LOOKING_FOR_LABELS[profile.looking_for] || profile.looking_for}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-jakarta font-medium"
          style={{ background: "rgba(245,158,11,0.08)", color: "#d97706" }}>
          ✨ Fé: {profile.faith_importance}/5
        </span>
      </div>
    </>
  );
}
