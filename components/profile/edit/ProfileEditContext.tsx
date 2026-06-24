"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Segurança Zod (Prevenção de XSS e Data Integrity)
const profileSchema = z.object({
  gender: z.enum(["male", "female"], { errorMap: () => ({ message: "Gênero inválido" }) }).optional(),
  birth_date: z.string().refine((val) => {
    if (!val) return true;
    const age = new Date().getFullYear() - new Date(val).getFullYear();
    return age >= 18;
  }, { message: "Você precisa ter no mínimo 18 anos" }).optional(),
  bio: z.string().max(500, "Bio muito longa (máx 500 caracteres)").optional(),
  looking_for: z.string().optional(),
  min_age_pref: z.number().min(18).max(99).optional(),
  max_age_pref: z.number().min(18).max(99).optional(),
  denomination: z.string().optional(),
  church_name: z.string().max(100).optional(),
  church_frequency: z.string().optional(),
  faith_importance: z.number().min(1).max(5).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(2).optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

interface ProfileEditContextData {
  formData: ProfileData;
  updateField: (field: keyof ProfileData, value: any) => void;
  saveProfile: () => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const ProfileEditContext = createContext<ProfileEditContextData | undefined>(undefined);

export function ProfileEditProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        
        const { data: profile, error } = await supabase
          .from("dating_profiles")
          .select("gender, birth_date, bio, looking_for, min_age_pref, max_age_pref, denomination, church_name, church_frequency, faith_importance, city, state")
          .eq("id", user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        if (profile) {
          setFormData(profile);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do perfil.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const updateField = (field: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      // 1. Zod Validation (Throws if invalid)
      const validData = profileSchema.parse(formData);
      
      // 2. RLS Enforcement (Upserting to own ID only)
      const { error } = await supabase
        .from("dating_profiles")
        .update(validData)
        .eq("id", userId);
        
      if (error) throw error;
      
      toast.success("Testemunho atualizado com sucesso! ✨");
      router.push("/profile");
      
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Erro ao salvar o perfil.");
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileEditContext.Provider value={{ formData, updateField, saveProfile, loading, saving }}>
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEdit() {
  const context = useContext(ProfileEditContext);
  if (!context) throw new Error("useProfileEdit deve ser usado dentro de ProfileEditProvider");
  return context;
}
