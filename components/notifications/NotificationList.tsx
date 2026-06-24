"use client";

import React from "react";
import { useNotifications } from "./NotificationsContext";
import { NotificationItem } from "./NotificationItem";
import { BellOff, Loader2 } from "lucide-react";

export function NotificationList() {
  const { groupedNotifications, loading } = useNotifications();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
        <Loader2 className="w-8 h-8 text-[#075E54] animate-spin mb-4" />
        <p className="text-sm font-jakarta text-gray-500">Buscando alertas...</p>
      </div>
    );
  }

  const groups = Object.keys(groupedNotifications);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5] p-5 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BellOff className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="font-outfit font-bold text-xl text-gray-900 mb-2">Nenhuma notificação</h2>
        <p className="font-manrope text-sm text-gray-500 max-w-[250px]">
          Sua caixa de entrada está limpa. Quando houver um match ou visita, avisaremos aqui!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F2F5] px-4 py-4">
      {groups.map((groupTitle) => (
        <div key={groupTitle} className="mb-6">
          <h2 className="text-xs font-bold font-jakarta text-gray-400 uppercase tracking-widest mb-3 pl-2">
            {groupTitle}
          </h2>
          <div>
            {groupedNotifications[groupTitle].map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      ))}
      <div className="h-10"></div>
    </div>
  );
}
