"use client";

import React from "react";
import { useProfileTestimony } from "./ProfileTestimonyContext";
import { Mic, Square, RotateCcw, CheckCircle2, Loader2, Video } from "lucide-react";

export function ProfileTestimonyActions() {
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    resetRecording, 
    saveTestimony, 
    mediaBlob,
    loading, 
    saving,
    mediaType
  } = useProfileTestimony();

  if (loading) return null;

  return (
    <div className="bg-white border-t border-gray-100 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-4">
      
      {!mediaBlob && !isRecording && (
        <button 
          onClick={startRecording}
          disabled={saving}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 8px 32px rgba(37,211,102,0.3)" }}
        >
          {mediaType === "audio" ? <Mic className="w-8 h-8 text-white" /> : <Video className="w-8 h-8 text-white" />}
        </button>
      )}

      {isRecording && (
        <button 
          onClick={stopRecording}
          className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500 transition-transform active:scale-95 animate-pulse"
          style={{ boxShadow: "0 8px 32px rgba(255,59,48,0.3)" }}
        >
          <Square className="w-8 h-8 text-white fill-white" />
        </button>
      )}

      {mediaBlob && !isRecording && (
        <div className="w-full flex items-center gap-3">
          <button 
            onClick={resetRecording}
            disabled={saving}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-gray-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5" />
            Gravar de Novo
          </button>
          
          <button 
            onClick={saveTestimony}
            disabled={saving}
            className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Salvar
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
