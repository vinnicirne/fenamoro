"use client";

import React, { useEffect } from "react";
import { useProfileTestimony } from "./ProfileTestimonyContext";

export function ProfileTestimonyVideo() {
  const { videoRef, isRecording, timeElapsed, maxTime, mediaBlob, videoStream, initCamera } = useProfileTestimony();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  useEffect(() => {
    initCamera();
  }, [initCamera]);

  useEffect(() => {
    if (mediaBlob) {
      const url = URL.createObjectURL(mediaBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [mediaBlob]);

  const percentage = (timeElapsed / maxTime) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-5 bg-black relative">
      
      {/* Container do Video */}
      <div className="w-full max-w-sm aspect-[3/4] relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
        
        {/* Preview Gravado */}
        {previewUrl && !isRecording ? (
          <video 
            src={previewUrl} 
            controls 
            playsInline
            className="w-full h-full object-cover" 
          />
        ) : (
          /* Live Camera Feed */
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }} // mirror front camera
          />
        )}

        {/* HUD de Gravação */}
        {isRecording && (
          <>
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white font-outfit font-bold text-sm tabular-nums">
                0:{timeElapsed.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Progress Bar na base do video */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
              <div 
                className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </>
        )}

        {!isRecording && videoStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <span className="text-white/80 font-jakarta font-bold text-sm">Pronto para gravar (15s máx)</span>
          </div>
        )}
      </div>

    </div>
  );
}
