import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface OrganizationSettings {
  setup_completed_at?: string | null;
  setup_skipped_at?: string | null;
  [key: string]: unknown;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = [
    "/projetos",
    "/orcamentos",
    "/calculadora",
    "/apresentacoes",
    "/financeiro",
    "/perfil",
    "/dashboard",
    "/brandbook",
  ];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Onboarding routes
  const onboardingRoutes = ["/welcome", "/setup"];
  const isOnboardingRoute = onboardingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Auth routes - redirect to projetos if already authenticated
  const authRoutes = ["/login", "/cadastro"];
  if (user && authRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/projetos";
    return NextResponse.redirect(url);
  }

  // Check onboarding status for authenticated users accessing protected routes
  if (user && (isProtectedRoute || pathname === "/")) {
    try {
      // Get user's organization settings
      const { data: profile } = await supabase.rpc("get_current_profile");

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("settings")
          .eq("id", profile.organization_id)
          .single();

        const settings = (org?.settings as OrganizationSettings) || {};
        const hasCompletedSetup = !!settings.setup_completed_at || !!settings.setup_skipped_at;

        // If setup not completed, redirect to welcome
        if (!hasCompletedSetup) {
          const url = request.nextUrl.clone();
          url.pathname = "/welcome";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      // If there's an error checking setup status, allow access to avoid blocking users
      console.error("Error checking setup status:", error);
    }

    // If on home page and setup is complete, redirect to projetos
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/projetos";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from onboarding if setup is complete
  if (user && isOnboardingRoute) {
    try {
      const { data: profile } = await supabase.rpc("get_current_profile");

      if (profile?.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("settings")
          .eq("id", profile.organization_id)
          .single();

        const settings = (org?.settings as OrganizationSettings) || {};
        const hasCompletedSetup = !!settings.setup_completed_at || !!settings.setup_skipped_at;

        // If setup is complete, redirect to projetos
        if (hasCompletedSetup) {
          const url = request.nextUrl.clone();
          url.pathname = "/projetos";
          return NextResponse.redirect(url);
        }
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
    }
  }

  // Redirect unauthenticated users away from onboarding
  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
