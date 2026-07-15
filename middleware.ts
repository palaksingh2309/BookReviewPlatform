import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { verifyAdminToken } from "./lib/admin-auth";
import { createAdminClient } from "./lib/supabase-admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static assets and icons pass
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 1. Fetch site configurations from database
  let maintenanceMode = false;
  let registrationEnabled = true;
  let communityEnabled = true;

  try {
    const supabase = createAdminClient();
    const { data: siteConfig } = await supabase
      .from("settings")
      .select("maintenance_mode, registration_enabled, community_enabled")
      .eq("id", "site_config")
      .maybeSingle();

    if (siteConfig) {
      maintenanceMode = siteConfig.maintenance_mode;
      registrationEnabled = siteConfig.registration_enabled;
      communityEnabled = siteConfig.community_enabled;
    }
  } catch (err) {
    console.error("Site settings query error in middleware:", err);
  }

  const adminToken = request.cookies.get("admin_session")?.value;
  const isValidAdmin = adminToken ? await verifyAdminToken(adminToken) : null;

  // 2. Enforce Maintenance Mode
  if (maintenanceMode) {
    const isAdminRoute = pathname.startsWith("/admin");
    const isMaintenanceRoute = pathname === "/maintenance";

    if (!isAdminRoute && !isMaintenanceRoute && !isValidAdmin) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } else {
    // If not in maintenance, redirect away from /maintenance page
    if (pathname === "/maintenance") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Enforce Registration toggle
  if (!registrationEnabled && pathname === "/signup") {
    return NextResponse.redirect(new URL("/login?error=registration-closed", request.url));
  }

  // 4. Enforce Community toggle
  if (!communityEnabled && pathname.startsWith("/feed")) {
    return NextResponse.redirect(new URL("/dashboard?error=community-disabled", request.url));
  }

  // 5. Protect admin routes
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = pathname === "/admin/login";

    if (isAdminLogin) {
      if (isValidAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (!isValidAdmin) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // 6. Handle standard user sessions
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/maintenance",
    "/admin/:path*",
    "/dashboard/:path*",
    "/feed/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/reading-list/:path*",
    "/reviews/:path*",
    "/login",
    "/signup",
  ],
};