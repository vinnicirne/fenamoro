"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProfileVerifyContextData {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  photoUrl: string | null;
  cameraActive: boolean;
  isAnalyzing: boolean;
  startCamera: () => void;
  takePhoto: () => void;
  retakePhoto: () => void;
  submitVerification: () => Promise<void>;
}

const ProfileVerifyContext = createContext<ProfileVerifyContextData | undefined>(undefined);

export function ProfileVerifyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 720 },
          height: { ideal: 1280 },
          facingMode: "user"
        }
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Erro na câmera:", err);
      toast.error("Permissão de câmera negada.");
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        // As it's a front camera, it is mirrored in CSS, we need to draw it mirrored
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            setPhotoBlob(blob);
            setPhotoUrl(URL.createObjectURL(blob));
            stopCamera();
          }
        }, "image/jpeg", 0.8);
      }
    }
  };

  const retakePhoto = () => {
    setPhotoUrl(null);
    setPhotoBlob(null);
    startCamera();
  };

  const submitVerification = async () => {
    if (!photoBlob) return;
    setIsAnalyzing(true);

    try {
      // 1. Efeito Psicológico: Simular análise biométrica (Loading Placebo de 3 segundos)
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 2. Upload para o bucket dating_media
      const fileName = `${user.id}_verification_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("dating_media")
        .upload(fileName, photoBlob, {
          contentType: "image/jpeg",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("dating_media")
        .getPublicUrl(fileName);

      // 3. Update profile to is_verified = true
      // Numa implementação real futura com webhook de IA, mudaríamos is_verified para pending
      // Para o MVP (Trust Effect), nós damos o verificado imediatamente se ele tirou a selfie com sucesso
      const { error: dbError } = await supabase
        .from("dating_profiles")
        .upsert({ 
          id: user.id,
          is_verified: true,
        }, { onConflict: 'id' });

      if (dbError) throw dbError;

      toast.success("Biometria aprovada! Você ganhou o Selo Azul 🛡️");
      router.push("/profile");

    } catch (err: any) {
      console.error(err);
      toast.error("Erro na verificação: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ProfileVerifyContext.Provider value={{
      videoRef, canvasRef, photoUrl, cameraActive, isAnalyzing,
      startCamera, takePhoto, retakePhoto, submitVerification
    }}>
      {children}
    </ProfileVerifyContext.Provider>
  );
}

export function useProfileVerify() {
  const context = useContext(ProfileVerifyContext);
  if (!context) throw new Error("useProfileVerify fora do provider");
  return context;
}
