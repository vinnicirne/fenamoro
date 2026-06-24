import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// ─── Security: Validate all input with Zod (SKILL) ────────────────────────────
const CheckEmailSchema = z.object({
  email: z
    .string()
    .min(1)
    .max(255)
    .email()
    .transform((v) => v.toLowerCase().trim()),
});

// ─── Security: Rate limiting (SKILL) ──────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max 10 checks per minute per IP
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── Security: Supabase client uses env vars only (SKILL) ─────────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role for cross-table lookup
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  // ─── Rate Limit Check ────────────────────────────────────────────────────
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      // SKILL: Generic error — don't leak internal details
      { error: "Too many requests. Try again in a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // ─── Input Validation ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = CheckEmailSchema.safeParse(body);
  if (!result.success) {
    // SKILL: Don't leak schema details to client
    return NextResponse.json({ error: "Invalid email format" }, { status: 422 });
  }

  const { email } = result.data;

  try {
    // ─── SKILL: Parameterized queries via Supabase SDK (no SQL concatenation) ──
    // Check FéConecta profiles
    const { data: feconectaProfile, error: fcErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)          // Parameterized — SDK handles escaping
      .maybeSingle();

    if (fcErr) throw fcErr;

    // Check FéNamoro profiles
    const { data: fenamoroProfile, error: fnErr } = await supabaseAdmin
      .from("dating_profiles")
      .select("id")
      .eq("email", email)          // Parameterized — SDK handles escaping
      .maybeSingle();

    if (fnErr) throw fnErr;

    // SKILL: Return only boolean flags — never return user IDs or sensitive data
    return NextResponse.json(
      {
        hasFeConecta: !!feconectaProfile,
        hasFenamoro: !!fenamoroProfile,
      },
      {
        status: 200,
        headers: {
          // SKILL: Prevent response caching to avoid stale auth state
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (err) {
    // SKILL: Log server-side, return generic message to client
    console.error("[check-email] Supabase error:", err);
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}

// Block all other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
