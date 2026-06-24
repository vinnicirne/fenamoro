"use client";

import React from "react";
import { useProfileNotifications } from "./ProfileNotificationsContext";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ProfileNotificationsActions() {
  const { saveNotifications, saving, loading } = useProfileNotifications();

  if (loading) return null;

  return (
    <div className="bg-white border-t border-gray-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
      <button 
        onClick={saveNotifications}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold font-jakarta text-white flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)", boxShadow: "0 8px 24px rgba(7,94,84,0.2)" }}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Salvar Preferências
          </>
        )}
      </button>
    </div>
  );
}
