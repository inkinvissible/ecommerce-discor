import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Obtener token de autenticación (ajusta según tu implementación)
    const token = request.cookies.get('token')?.value ||
        request.headers.get('authorization')

    const isAuthenticated = !!token

    // Rutas públicas (solo login)
    const publicRoutes = ['/login']

    // Rutas protegidas
    const protectedRoutes = ['/cart', '/dashboard', '/products', '/orders', '/download-excel', '/profile', '/settings']

    // Si está en la página principal
    if (pathname === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Si está en una ruta pública y ya está autenticado, redirigir a dashboard
    if (publicRoutes.includes(pathname) && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si está en una ruta protegida sin autenticación, redirigir a login
    if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Si intenta acceder a cualquier otra ruta sin autenticación, redirigir a login
    if (!publicRoutes.includes(pathname) && !isAuthenticated && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)).*)'],
}