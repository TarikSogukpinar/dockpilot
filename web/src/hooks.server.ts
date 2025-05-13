import type { Handle } from '@sveltejs/kit';

// Config'den import ederek değil, burada tanımlayarak sabitleyelim
const AUTH_COOKIE_NAME = 'auth_token';

export const handle: Handle = async ({ event, resolve }) => {
    // Get the auth token from cookies using the correct constant
    const token = event.cookies.get(AUTH_COOKIE_NAME);
    // Remove root path from public paths and ensure dashboard requires authentication
    const publicPaths = ['/login', '/register'];
    
    // Geçerli yolun herhangi bir public path ile başlayıp başlamadığını kontrol et
    const isPublicPath = publicPaths.some(path => 
        event.url.pathname === path || 
        (path !== '/' && event.url.pathname.startsWith(path + '/'))
    );
    
    console.log('Server hook checking path:', {
        path: event.url.pathname,
        hasToken: !!token,
        isPublicPath
    });
    
    // Check if the path requires authentication
    if (!isPublicPath && !token) {
        console.log('Server redirecting to login, no token for protected path');
        // Redirect to login if no token is present
        return new Response('Redirect', {
            status: 303,
            headers: { Location: '/login' }
        });
    }

    const response = await resolve(event);
    return response;
}; 