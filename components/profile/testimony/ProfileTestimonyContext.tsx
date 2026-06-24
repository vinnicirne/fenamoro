"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type MediaType = "audio" | "video";

interface ProfileTestimonyContextData {
  mediaType: MediaType;
  setMediaType: (t: MediaType) => void;
  isRecording: boolean;
  isPaused: boolean;
  timeElapsed: number;
  maxTime: number;
  mediaBlob: Blob | null;
  videoStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  initCamera: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  saveTestimony: () => Promise<void>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const ProfileTestimonyContext = createContext<ProfileTestimonyContextData | undefined>(undefined);

export function ProfileTestimonyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mediaType, setMediaType] = useState<MediaType>("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // currently not using pause, but good for future
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const maxTime = mediaType === "audio" ? 45 : 15;

  // Cleanup on unmount or type change
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mediaType]);

  const stopMediaTracks = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const initCamera = React.useCallback(async () => {
    if (videoStream) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 480 }, height: { ideal: 640 }, facingMode: "user" }
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Erro ao iniciar camera preview:", err);
    }
  }, [videoStream]);

  const startRecording = async () => {
    try {
      setError(null);
      setMediaBlob(null);
      chunksRef.current = [];
      setTimeElapsed(0);

      let stream: MediaStream;
      
      if (mediaType === "audio") {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } else {
        if (videoStream) {
          stream = videoStream;
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
              width: { ideal: 480 },
              height: { ideal: 640 },
              facingMode: "user"
            }
          });
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        }
      }

      const options = mediaType === "video" 
        ? { videoBitsPerSecond: 500000 } 
        : {};

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback for Safari/iOS
        recorder = new MediaRecorder(stream);
      }
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || (mediaType === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, { type });
        setMediaBlob(blob);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setVideoStream(null);
      };

      recorder.start(500); // Coleta dados a cada 500ms
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          if (prev >= maxTime - 1) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return maxTime;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError("Permissão negada ou erro ao acessar câmera/microfone.");
      toast.error("Permissão negada ou dispositivo não encontrado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    stopRecording();
    stopMediaTracks();
    setMediaBlob(null);
    setTimeElapsed(0);
    chunksRef.current = [];
  };

  const saveTestimony = async () => {
    if (!mediaBlob) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const ext = mediaType === "video" ? "webm" : "webm";
      const fileName = `${user.id}_${Date.now()}.${ext}`;

      // Upload to Storage
      const { data, error: uploadError } = await supabase.storage
        .from('dating_media')
        .upload(fileName, mediaBlob, {
          contentType: mediaBlob.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('dating_media')
        .getPublicUrl(fileName);

      const fileUrl = publicUrlData.publicUrl;

      // Update DB
      const { error: dbError } = await supabase
        .from("dating_profiles")
        .update({ testimony_url: fileUrl, testimony_type: mediaType })
        .eq("id", user.id);

      if (dbError) throw dbError;

      toast.success("Testemunho salvo com sucesso! 🎉");
      router.push("/profile");

    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar testemunho: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileTestimonyContext.Provider value={{
      mediaType, setMediaType, isRecording, isPaused, timeElapsed, maxTime,
      mediaBlob, videoStream, videoRef, initCamera, startRecording, stopRecording, resetRecording,
      saveTestimony, loading, saving, error
    }}>
      {children}
    </ProfileTestimonyContext.Provider>
  );
}

export function useProfileTestimony() {
  const context = useContext(ProfileTestimonyContext);
  if (!context) throw new Error("useProfileTestimony fora do provider");
  return context;
}
