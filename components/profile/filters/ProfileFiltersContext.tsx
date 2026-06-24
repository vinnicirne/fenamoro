"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const filtersSchema = z.object({
  min_age_pref: z.number().min(18).max(99).default(18),
  max_age_pref: z.number().min(18).max(99).default(99),
  max_distance_pref: z.number().min(1).max(200).default(50),
  preferred_denomination: z.string().default("todas"),
}).refine(data => data.max_age_pref >= data.min_age_pref, {
  message: "A idade máxima deve ser maior que a mínima",
  path: ["max_age_pref"],
});

type FiltersData = z.infer<typeof filtersSchema>;

interface ProfileFiltersContextData {
  filters: FiltersData;
  updateFilter: (field: keyof FiltersData, value: any) => void;
  saveFilters: () => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const ProfileFiltersContext = createContext<ProfileFiltersContextData | undefined>(undefined);

export function ProfileFiltersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [filters, setFilters] = useState<FiltersData>({
    min_age_pref: 18,
    max_age_pref: 45,
    max_distance_pref: 50,
    preferred_denomination: "todas"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        
        const { data: profile, error } = await supabase
          .from("dating_profiles")
          .select("min_age_pref, max_age_pref, max_distance_pref, preferred_denomination")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (profile) {
          setFilters({
            min_age_pref: profile.min_age_pref || 18,
            max_age_pref: profile.max_age_pref || 45,
            max_distance_pref: profile.max_distance_pref || 50,
            preferred_denomination: profile.preferred_denomination || "todas"
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar preferências.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, [router]);

  const updateFilter = (field: keyof FiltersData, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const saveFilters = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      const validData = filtersSchema.parse(filters);
      
      const { error } = await supabase
        .from("dating_profiles")
        .upsert({
          id: userId,
          ...validData
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      toast.success("Filtros atualizados! 🎯");
      router.push("/profile");
      
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Erro ao salvar filtros.");
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileFiltersContext.Provider value={{ filters, updateFilter, saveFilters, loading, saving }}>
      {children}
    </ProfileFiltersContext.Provider>
  );
}

export function useProfileFilters() {
  const context = useContext(ProfileFiltersContext);
  if (!context) throw new Error("useProfileFilters deve ser usado dentro do provider");
  return context;
}
