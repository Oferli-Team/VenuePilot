import { withAuth } from "next-auth/middleware";
import { NextResponse, type NextRequest } from "next/server";

export default withAuth(
  function middleware(request: NextRequest) {
    const response = NextResponse.next();

    const pathname = request.nextUrl.pathname;

    if (pathname.startsWith("/manada")) {
      const [, , orgSlug, , eventSlug] = pathname.split("/");
      if (orgSlug) {
        const currentOrgSlug = request.cookies.get("orgSlug")?.value;

        response.cookies.set("orgSlug", orgSlug, {
          maxAge: 60 * 24 * 60 * 60, // 60 days
        });

        if (currentOrgSlug && currentOrgSlug !== orgSlug) {
          response.cookies.delete("eventSlug");
        }

        if (eventSlug) {
          const currentEventSlug = request.cookies.get("eventSlug")?.value;

          if (currentEventSlug !== eventSlug) {
            response.cookies.set("eventSlug", eventSlug);
          }
        }
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // // Allow access to authentication-related routes
        // const pathname = req.nextUrl.pathname
        // console.log({pathname});
        // if (pathname.startsWith('/auth/') ||
        //     pathname.startsWith('/api/auth/') ||
        //     pathname === '/auth' ||
        //     pathname === '/identificacao') {
        //   return true
        // }
        // // For all other routes, require authentication
        // return !!token
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/manada/:path*", "/identificacao"],
};
