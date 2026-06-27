"use client";

import React, { useState, useRef, useCallback } from "react";
import { z } from "zod";
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight, Flame, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ─── Zod Schemas (Security Review) ────────────────────────────────────────────
const LoginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").max(255).email("E-mail inválido").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
});

// ─── Rate Limiter (Security Review) ───────────────────────────────────────────
const rateLimiter = {
  attempts: 0, lastReset: Date.now(), MAX: 5, WINDOW: 60_000,
  check() {
    const now = Date.now();
    if (now - this.lastReset > this.WINDOW) { this.attempts = 0; this.lastReset = now; }
    return ++this.attempts <= this.MAX;
  },
  wait() { return Math.ceil((this.WINDOW - (Date.now() - this.lastReset)) / 1000); },
};

type Mode = "login" | "sso";

export default function FenamoroLoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Check if running in Capacitor native app
      const isNative = typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform();
      const redirectUrl = isNative 
        ? 'fenamoro://login-callback' 
        : `${window.location.origin}`;

      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login com Google.");
      setLoading(false);
    }
  };

  // ─── Login direto (FéNamoro ou FéConecta — mesmo banco) ───────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!rateLimiter.check()) {
      toast.error(`Muitas tentativas. Aguarde ${rateLimiter.wait()}s.`);
      return;
    }

    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) { setError(result.error.errors[0].message); return; }

    setLoading(true);
    try {
      const { data: userData, error: sbError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });

      if (sbError || !userData?.user) {
        // Security: não revelar se email ou senha é o problema
        setError("E-mail ou senha incorretos");
        return;
      }

      if (mode === "sso") {
        toast("Gerando ticket de SSO no app de origem...");
        const { data: ticketId } = await supabase.rpc("generate_sso_ticket", { p_user_id: userData.user.id });
        await supabase.auth.signOut();
        window.location.href = `/api/sso/consume?ticket=${ticketId}`;
        return;
      }

      toast.success("Bem-vindo ao FéNamoro! 🕊️");
      window.location.href = "/feed";
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0a1f1c 0%, #111B21 50%, #0a1a14 100%)" }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(7,94,84,0.35)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(18,140,126,0.2)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "rgba(37,211,102,0.05)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)", boxShadow: "0 20px 60px rgba(7,94,84,0.5)" }}>
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <h1 className="font-outfit font-bold text-3xl text-white tracking-tight">FéNamoro</h1>
          <p className="text-white/50 text-sm mt-1">Conexões com propósito e fé</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7 shadow-2xl"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {/* Tab selector */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className="flex-1 py-2 rounded-xl text-sm font-semibold font-jakarta transition-all"
              style={mode === "login"
                ? { background: "linear-gradient(135deg, #075E54, #128C7E)", color: "white" }
                : { color: "rgba(255,255,255,0.4)" }}>
              Minha conta
            </button>
            <button
              onClick={() => { setMode("sso"); setError(null); }}
              className="flex-1 py-2 rounded-xl text-sm font-semibold font-jakarta transition-all flex items-center justify-center gap-1.5"
              style={mode === "sso"
                ? { background: "linear-gradient(135deg, #075E54, #128C7E)", color: "white" }
                : { color: "rgba(255,255,255,0.4)" }}>
              <Flame className="w-3.5 h-3.5" />
              FéConecta
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Modo FéConecta */}
            {mode === "sso" && (
              <div className="p-3.5 rounded-2xl mb-2" style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)" }}>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#25D366" }} />
                  <p className="text-xs font-manrope" style={{ color: "rgba(255,255,255,0.7)" }}>
                    Use o mesmo <span className="font-semibold" style={{ color: "#25D366" }}>e-mail e senha</span> da sua conta FéConecta para entrar aqui.
                  </p>
                </div>
              </div>
            )}

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-black py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuar com o Google
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ou entre com email</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Campo email */}
            <div>
              <label className="block text-white/60 text-xs font-jakarta font-medium mb-2 uppercase tracking-wider">
                E-mail {mode === "sso" ? "do FéConecta" : ""}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="email-input"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-white text-sm outline-none transition-all placeholder:text-white/25"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>

            {/* Campo senha */}
            <div>
              <label className="block text-white/60 text-xs font-jakarta font-medium mb-2 uppercase tracking-wider">
                Senha {mode === "sso" ? "do FéConecta" : ""}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  maxLength={128}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-white text-sm outline-none transition-all placeholder:text-white/25"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs font-jakarta">{error}</p>
              </div>
            )}

            {/* Esqueci senha */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-jakarta transition-colors" style={{ color: "#25D366" }}>
                Esqueci minha senha
              </Link>
            </div>

            {/* Botão submit */}
            <button
              id="btn-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full text-white font-semibold font-jakarta rounded-2xl py-4 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", boxShadow: "0 8px 24px rgba(37,211,102,0.25)" }}>
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>
                    {mode === "sso" ? <Flame className="w-5 h-5 fill-white" /> : <Heart className="w-5 h-5 fill-white" />}
                    <span>{mode === "sso" ? "Entrar com FéConecta" : "Entrar no FéNamoro"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>}
            </button>
          </form>

          {/* Cadastro */}
          <div className="relative flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-white/30 text-xs font-jakarta">novo por aqui?</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          <Link href="/register"
            className="w-full text-white font-medium font-jakarta rounded-2xl py-3.5 flex items-center justify-center gap-2 transition-all text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            Criar conta gratuita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-center gap-2 mt-5 text-white/20 text-xs font-jakarta">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Conexão segura e criptografada</span>
        </div>
        <p className="text-center text-white/20 text-xs font-jakarta mt-2">
          Ao entrar, você aceita os{" "}
          <Link href="/terms" className="underline hover:text-white/40 transition-colors">Termos</Link>
          {" "}e a{" "}
          <Link href="/privacy" className="underline hover:text-white/40 transition-colors">Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
