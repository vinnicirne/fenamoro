"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<"matches"|"interests">("matches");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/login");
        return;
      }
      const uId = userData.user.id;
      setUserId(uId);

      try {
        // 1. Fetch current user plan
        const { data: myProfile } = await supabase.from("dating_profiles").select("plan").eq("id", uId).single();
        const isPremium = myProfile?.plan === "premium";
        setIsPremium(isPremium);

        // 2. Fetch matches
        const { data: dbMatches } = await supabase
          .from("dating_matches")
          .select("*")
          .or(`user1_id.eq.${uId},user2_id.eq.${uId}`)
          .order("created_at", { ascending: false });

        if (dbMatches && dbMatches.length > 0) {
          const otherUserIds = dbMatches.map(m => m.user1_id === uId ? m.user2_id : m.user1_id);
          const { data: profiles } = await supabase.from("dating_profiles").select("id, name, is_verified, feconecta_verified").in("id", otherUserIds);
          const { data: photos } = await supabase.from("dating_photos").select("profile_id, url").in("profile_id", otherUserIds).eq("is_main", true);

          const richMatches = dbMatches.map(m => {
            const otherId = m.user1_id === uId ? m.user2_id : m.user1_id;
            const profile = profiles?.find(p => p.id === otherId);
            const photo = photos?.find(p => p.profile_id === otherId);
            return {
              match_id: m.id,
              other_id: otherId,
              name: profile?.name || "Usuário",
              photo: photo?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
              is_verified: profile?.is_verified,
              created_at: m.created_at,
            };
          });
          setMatches(richMatches);
        }

        // 3. Fetch Interested (who sent me Orar, but we didn't match yet)
        const { data: dbOrar } = await supabase
          .from("dating_orar")
          .select("sender_id, created_at")
          .eq("receiver_id", uId)
          .order("created_at", { ascending: false });

        if (dbOrar && dbOrar.length > 0) {
          // Filter out those who are already matches
          const matchedIds = dbMatches?.map(m => m.user1_id === uId ? m.user2_id : m.user1_id) || [];
          const pendingOrar = dbOrar.filter(o => !matchedIds.includes(o.sender_id));
          
          if (pendingOrar.length > 0) {
            const senderIds = pendingOrar.map(o => o.sender_id);
            const { data: profiles } = await supabase.from("dating_profiles").select("id, name").in("id", senderIds);
            const { data: photos } = await supabase.from("dating_photos").select("profile_id, url").in("profile_id", senderIds).eq("is_main", true);

            const richInterests = pendingOrar.map(o => {
              const profile = profiles?.find(p => p.id === o.sender_id);
              const photo = photos?.find(p => p.profile_id === o.sender_id);
              return {
                id: o.sender_id,
                name: profile?.name || "Alguém",
                photo: photo?.url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
              };
            });
            setInterests(richInterests);
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [router]);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F0F2F5]">
      {/* ── Header ── */}
      <header className="flex items-center px-5 pt-[env(safe-area-inset-top)] pt-4 pb-3"
        style={{ background: "linear-gradient(135deg, #075E54, #128C7E)" }}>
        <button onClick={() => router.push("/feed")} className="mr-3 p-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-outfit font-bold text-lg text-white">Seus Matches</h1>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex bg-white px-5 pt-3 pb-0 border-b border-gray-200">
        <button onClick={() => setActiveTab("matches")} className={`flex-1 pb-3 text-sm font-bold font-jakarta border-b-2 transition-colors ${activeTab === "matches" ? "border-[#075E54] text-[#075E54]" : "border-transparent text-gray-400"}`}>
          Matches
        </button>
        <button onClick={() => setActiveTab("interests")} className={`flex-1 pb-3 text-sm font-bold font-jakarta border-b-2 transition-colors ${activeTab === "interests" ? "border-[#075E54] text-[#075E54]" : "border-transparent text-gray-400"}`}>
          Interessados
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075E54]"></div>
          </div>
        ) : activeTab === "matches" ? (
          matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-outfit font-bold text-lg mb-1">Nenhum Match Ainda</h3>
              <p className="text-gray-500 font-jakarta text-sm px-4">
                Continue orando por perfis no Feed. Quando houver interesse mútuo, eles aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {matches.map((match) => (
                <div 
                  key={match.match_id}
                  onClick={() => router.push(`/chat/${match.match_id}`)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative w-20 h-20 mb-2">
                    <img 
                      src={match.photo} 
                      alt={match.name} 
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-sm group-hover:border-[#25D366] transition-colors"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#25D366] border-2 border-white rounded-full"></div>
                  </div>
                  <span className="font-outfit font-bold text-gray-900 text-sm truncate w-full text-center">
                    {match.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Aba Interessados */
          interests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="text-gray-900 font-outfit font-bold text-lg mb-1">Nenhum Interessado</h3>
              <p className="text-gray-500 font-jakarta text-sm px-4">
                Quando alguém orar por você, aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {interests.map((interest) => (
                <div 
                  key={interest.id}
                  onClick={() => !isPremium && router.push("/premium")}
                  className="relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
                >
                  <img 
                    src={interest.photo} 
                    alt="Interessado" 
                    className={`w-full h-full object-cover transition-all ${isPremium ? '' : 'blur-md brightness-50'}`}
                  />
                  {!isPremium && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                        <span className="text-white">🔒</span>
                      </div>
                      <span className="text-white font-bold font-jakarta text-xs">Ver perfil</span>
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-white font-bold font-jakarta text-sm drop-shadow-md">{interest.name.split(" ")[0]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
        style={{ background: "white", borderTop: "1px solid #E5E7EB" }}>
        {[
          { icon: require("lucide-react").Home, label: "Início", href: "/feed", active: false },
          { icon: require("lucide-react").Compass, label: "Explorar", href: "/explore", active: false },
          { icon: require("lucide-react").MessageCircle, label: "Matches", href: "/matches", active: true },
          { icon: require("lucide-react").User, label: "Perfil", href: "/profile", active: false },
        ].map(({ icon: Icon, label, href, active }) => (
          <button key={href} onClick={() => router.push(href)}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-2xl transition-all"
            style={{ color: active ? "#075E54" : "#9CA3AF" }}>
            <Icon className={`w-6 h-6 ${active ? "fill-current" : ""}`} />
            <span className="text-[10px] font-bold font-jakarta">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
