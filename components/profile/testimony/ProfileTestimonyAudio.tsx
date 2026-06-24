"use client";

import React, { useEffect, useState } from "react";
import { useProfileTestimony } from "./ProfileTestimonyContext";
import { Mic } from "lucide-react";

export function ProfileTestimonyAudio() {
  const { isRecording, timeElapsed, maxTime, mediaBlob } = useProfileTestimony();
  const [bars, setBars] = useState<number[]>([]);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  useEffect(() => {
    if (mediaBlob) {
      const url = URL.createObjectURL(mediaBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [mediaBlob]);

  // Generate random bars for fake audio visualizer while recording
  useEffect(() => {
    if (!isRecording) {
      setBars(Array.from({ length: 20 }, () => 10)); // resting state
      return;
    }
    const interval = setInterval(() => {
      setBars(Array.from({ length: 20 }, () => Math.floor(Math.random() * 80) + 10));
    }, 150);
    return () => clearInterval(interval);
  }, [isRecording]);

  const percentage = (timeElapsed / maxTime) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 bg-[#0a1f1c] relative overflow-hidden">
      
      {/* Background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000 ${isRecording ? "bg-red-500/20" : "bg-[#25D366]/10"}`} />

      {/* Media Player for Preview */}
      {previewUrl && !isRecording && (
        <div className="relative z-10 w-full max-w-sm mb-12">
          <p className="text-white/60 text-xs font-jakarta text-center mb-4">Ouça como ficou:</p>
          <audio controls src={previewUrl} className="w-full rounded-2xl" />
        </div>
      )}

      {/* Visualizer */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-1.5 h-24 mb-8">
          {bars.map((height, i) => (
            <div 
              key={i} 
              className="w-1.5 rounded-full transition-all duration-150"
              style={{ height: `${height}%`, background: isRecording ? "#FF3B30" : "#25D366" }}
            />
          ))}
        </div>

        {/* Timer Text */}
        <h2 className="text-5xl font-outfit font-black text-white tabular-nums tracking-tighter">
          0:{timeElapsed.toString().padStart(2, "0")}
        </h2>
        <p className="text-white/50 text-sm font-jakarta mt-2">
          Max {maxTime}s
        </p>

        {/* Circular Progress (Fake around the Mic icon would be cool, but we keep it simple here) */}
        <div className="mt-8 w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%`, background: isRecording ? "#FF3B30" : "#25D366" }}
          />
        </div>
      </div>

    </div>
  );
}
