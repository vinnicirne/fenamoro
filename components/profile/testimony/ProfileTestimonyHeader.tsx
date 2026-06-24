"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mic, Video } from "lucide-react";
import { useProfileTestimony } from "./ProfileTestimonyContext";

export function ProfileTestimonyHeader() {
  const router = useRouter();
  const { mediaType, setMediaType, isRecording, saving } = useProfileTestimony();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()} 
          disabled={isRecording || saving}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <span className="text-xs font-bold font-jakarta text-gray-400 uppercase tracking-widest">
          Sua Voz
        </span>
        <div className="w-10"></div>
      </div>
      
      <h1 className="font-outfit font-black text-2xl text-gray-900 tracking-tight leading-tight mb-2">
        Apresente sua <br />
        <span className="text-[#075E54]">Essência</span>
      </h1>
      <p className="font-manrope text-sm text-gray-500 max-w-[280px] mb-6">
        Conte-nos rapidamente quem você é e o que Deus significa na sua vida.
      </p>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          disabled={isRecording || saving}
          onClick={() => setMediaType("audio")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-jakarta font-bold transition-all ${
            mediaType === "audio" ? "bg-white text-[#075E54] shadow-sm" : "text-gray-500"
          }`}
        >
          <Mic className="w-4 h-4" />
          Áudio (45s)
        </button>
        <button
          disabled={isRecording || saving}
          onClick={() => setMediaType("video")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-jakarta font-bold transition-all ${
            mediaType === "video" ? "bg-white text-[#075E54] shadow-sm" : "text-gray-500"
          }`}
        >
          <Video className="w-4 h-4" />
          Vídeo (15s)
        </button>
      </div>
    </header>
  );
}
