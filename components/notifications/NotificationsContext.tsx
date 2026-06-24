"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  type: string;
  title: string;
  content: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationsContextData {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteAll: () => Promise<void>;
  groupedNotifications: Record<string, Notification[]>;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextData | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar notificações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
      fetchNotifications(data.user.id);
    });
  }, [router]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("recipient_id", userId).eq("is_read", false);
      toast.success("Todas lidas!");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAll = async () => {
    if (!userId) return;
    setNotifications([]);
    try {
      await supabase.from("notifications").delete().eq("recipient_id", userId);
      toast.success("Notificações limpas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao limpar notificações.");
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      "Hoje": [],
      "Ontem": [],
      "Esta Semana": [],
      "Mais antigas": []
    };

    notifications.forEach(n => {
      const date = new Date(n.created_at);
      if (isToday(date)) groups["Hoje"].push(n);
      else if (isYesterday(date)) groups["Ontem"].push(n);
      else if (isThisWeek(date)) groups["Esta Semana"].push(n);
      else groups["Mais antigas"].push(n);
    });

    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, arr]) => arr.length > 0));
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, loading, markAsRead, markAllAsRead, deleteAll, groupedNotifications, unreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications deve ser usado dentro do provider");
  return context;
}
