import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get("ticket");

  if (!ticket) {
    return NextResponse.json({ error: "Missing SSO ticket" }, { status: 400 });
  }

  try {
    // 1. Consume ticket to get user_id
    const { data: userId, error: consumeError } = await supabaseAdmin.rpc("consume_sso_ticket", { p_ticket_id: ticket });
    
    if (consumeError || !userId) {
      return NextResponse.json({ error: "Invalid or expired ticket" }, { status: 401 });
    }

    // 2. Fetch user email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = userData.user.email;

    // 3. Generate Magic Link (PKCE login link) for seamless session establishment
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Magic link generation failed:", linkError);
      return NextResponse.json({ error: "Could not generate auth session" }, { status: 500 });
    }

    // Parse the token from the action_link
    const actionUrl = new URL(linkData.properties.action_link);
    const token = actionUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "No token found in action link" }, { status: 500 });
    }

    // 4. Redirect browser to our local SSO callback
    const callbackUrl = new URL("/sso-callback", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001");
    callbackUrl.searchParams.set("token", token);
    callbackUrl.searchParams.set("email", userEmail);

    return NextResponse.redirect(callbackUrl.toString());

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
