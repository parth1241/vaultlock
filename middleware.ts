import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based protection
    if (path.startsWith("/client") && token?.role !== "client") {
      return NextResponse.redirect(new URL("/freelancer/dashboard", req.url));
    }

    if (path.startsWith("/freelancer") && token?.role !== "freelancer") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Public routes
        if (
          path === "/" ||
          path.startsWith("/escrow/") ||
          path.startsWith("/invite/") ||
          path.startsWith("/about") ||
          path.startsWith("/blog") ||
          path.startsWith("/pricing") ||
          path.startsWith("/contact") ||
          path.startsWith("/privacy") ||
          path.startsWith("/terms") ||
          path.startsWith("/login") ||
          path.startsWith("/signup") ||
          path.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected routes require token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/client/:path*",
    "/freelancer/:path*",
    "/settings/:path*",
    // Add other protected paths here
  ],
};
