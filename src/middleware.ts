import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextFetchEvent, NextResponse } from 'next/server';
// export default withMiddlewareAuthRequired();

function isMobile(userAgent: string | null): boolean {
    if (!userAgent) return false;
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);
}

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    console.log('Middleware triggered for:', pathname);

    // Screen size detection (using a query parameter for simplicity, since screen size isn't part of the request directly)
    const userAgent = req.headers.get('user-agent') || '';

    if (pathname.startsWith('/mobile')) {
        console.log('Request is for /mobile, skipping mobile redirection.');
        return NextResponse.next();
    }

    if (isMobile(userAgent)) {
        console.log('Redirecting to mobile page due to mobile User-Agent');
        return NextResponse.redirect(new URL('/mobile', req.url)); // Redirect to the /mobile page
    }



    if (pathname.startsWith('/dashboard')) {
        const auth0Middleware = withMiddlewareAuthRequired()
        return auth0Middleware(req, ev)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/about", "/donate", "/contact", "/howitworks", "/projectgoals", "/dashboard/:path*"],
};