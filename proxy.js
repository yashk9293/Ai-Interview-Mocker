import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/forum(.*)',
  ]);

  // With jwtKey, sessions are verified locally instead of fetching Clerk's
  // keys over the network on each request. The SDK doesn't read
  // CLERK_JWT_KEY by itself, so it's passed here; unset, it falls back.
  export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
  }, { jwtKey: process.env.CLERK_JWT_KEY });

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};