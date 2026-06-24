"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

export function NotificationsHeader() {
  const router = useRouter();
  const { markAllAsRead, deleteAll, unreadCount, notifications } = useNotifications();

  return (
    <header className="px-5 pt-[env(safe-area-inset-top)] pt-6 pb-4 bg-white relative z-20 shadow-sm border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-outfit font-black text-xl text-gray-900 tracking-tight leading-tight">
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p className="text-xs font-jakarta text-[#075E54] font-bold">
              {unreadCount} nova{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors group"
            title="Marcar todas como lidas"
          >
            <CheckCheck className="w-5 h-5 text-gray-400 group-hover:text-[#075E54] transition-colors" />
          </button>
        )}
        {notifications.length > 0 && (
          <button 
            onClick={() => {
              if (window.confirm("Tem certeza que deseja apagar todas as notificações?")) {
                deleteAll();
              }
            }}
            className="p-2 rounded-full hover:bg-red-50 transition-colors group"
            title="Limpar tudo"
          >
            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>
    </header>
  );
}
