"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Eye, Bell, ShieldCheck } from "lucide-react";
import { Notification, useNotifications } from "./NotificationsContext";

export function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead } = useNotifications();

  const getIconAndColor = (type: string) => {
    switch (type) {
      case "dating_match": return { icon: Heart, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" };
      case "dating_message": return { icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" };
      case "dating_view": return { icon: Eye, color: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" };
      case "verification_approved": return { icon: ShieldCheck, color: "text-[#25D366]", bg: "bg-[#25D366]/10", border: "border-[#25D366]/20" };
      default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-200" };
    }
  };

  const getTargetUrl = (notification: Notification) => {
    if (notification.type === "dating_match") return "/matches";
    if (notification.type === "dating_message") return `/matches/chat/${notification.sender_id}`;
    if (notification.metadata?.url) return notification.metadata.url;
    return "#";
  };

  const { icon: Icon, color, bg, border } = getIconAndColor(notification.type);
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ptBR });
  const isUnread = !notification.is_read;

  return (
    <Link 
      href={getTargetUrl(notification)}
      onClick={() => isUnread && markAsRead(notification.id)}
      className={`block p-4 mb-2 rounded-2xl border transition-all active:scale-[0.98] ${
        isUnread ? `bg-white shadow-sm ${border}` : 'bg-transparent border-transparent opacity-75'
      }`}
    >
      <div className="flex gap-4">
        {/* Ícone */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        
        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-jakarta text-sm truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
              {notification.title}
            </h3>
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-[#075E54] flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(7,94,84,0.5)]"></span>
            )}
          </div>
          <p className="text-gray-500 font-manrope text-xs mt-0.5 line-clamp-2 leading-relaxed">
            {notification.content}
          </p>
          <p className="text-gray-400 font-jakarta text-[10px] mt-2 font-medium">
            {timeAgo}
          </p>
        </div>
      </div>
    </Link>
  );
}
