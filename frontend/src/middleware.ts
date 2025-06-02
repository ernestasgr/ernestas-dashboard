import { NextRequest, NextResponse } from 'next/server';

// export function refreshTokensMiddleware(request: NextRequest) {
//     const accessToken = request.cookies.get('accessToken');
//     const refreshToken = request.cookies.get('refreshToken');
//     const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

//     if (isDashboard && !accessToken) {
//         if (refreshToken) {

//         }

//         return NextResponse.redirect(new URL('/login', request.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: ['/dashboard/:path*'],
// };

export function middleware(request: NextRequest) {
    return NextResponse.next();
}
