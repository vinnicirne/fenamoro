"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const notificationsSchema = z.object({
  notify_new_matches: z.boolean().default(true),
  notify_new_messages: z.boolean().default(true),
  notify_profile_views: z.boolean().default(true),
  notify_email_digest: z.boolean().default(false),
});

type NotificationsData = z.infer<typeof notificationsSchema>;

interface ProfileNotificationsContextData {
  notifications: NotificationsData;
  toggleNotification: (field: keyof NotificationsData) => void;
  saveNotifications: () => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const ProfileNotificationsContext = createContext<ProfileNotificationsContextData | undefined>(undefined);

export function ProfileNotificationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationsData>({
    notify_new_matches: true,
    notify_new_messages: true,
    notify_profile_views: true,
    notify_email_digest: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setUserId(user.id);
        
        const { data: profile, error } = await supabase
          .from("dating_profiles")
          .select("notify_new_matches, notify_new_messages, notify_profile_views, notify_email_digest")
          .eq("id", user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        if (profile) {
          setNotifications({
            notify_new_matches: profile.notify_new_matches ?? true,
            notify_new_messages: profile.notify_new_messages ?? true,
            notify_profile_views: profile.notify_profile_views ?? true,
            notify_email_digest: profile.notify_email_digest ?? false,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar preferências de notificação.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [router]);

  const toggleNotification = (field: keyof NotificationsData) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const saveNotifications = async () => {
    if (!userId) return;
    setSaving(true);
    
    try {
      const validData = notificationsSchema.parse(notifications);
      
      const { error } = await supabase
        .from("dating_profiles")
        .upsert({
          id: userId,
          ...validData
        }, { onConflict: 'id' });
        
      if (error) throw error;
      
      toast.success("Preferências atualizadas! 🔔");
      router.push("/profile");
      
    } catch (err: any) {
      toast.error("Erro ao salvar notificações.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileNotificationsContext.Provider value={{ notifications, toggleNotification, saveNotifications, loading, saving }}>
      {children}
    </ProfileNotificationsContext.Provider>
  );
}

export function useProfileNotifications() {
  const context = useContext(ProfileNotificationsContext);
  if (!context) throw new Error("useProfileNotifications deve ser usado dentro do provider");
  return context;
}
