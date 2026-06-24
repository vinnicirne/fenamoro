"use client";

import React from "react";
import { useProfileEdit } from "./ProfileEditContext";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ProfileEditActions() {
  const { saveProfile, saving, loading } = useProfileEdit();

  if (loading) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-5 pt-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-transparent">
      <button 
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}>
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Salvando Testemunho...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Salvar Perfil
          </>
        )}
      </button>
    </div>
  );
}
