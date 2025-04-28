import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // Get the auth token from cookies
    const token = event.cookies.get('auth_token');
    const publicPaths = ['/login', '/register'];
    
    // Check if the path requires authentication
    if (!publicPaths.includes(event.url.pathname) && !token) {
        // Redirect to login if no token is present
        return new Response('Redirect', {
            status: 303,
            headers: { Location: '/login' }
        });
    }

    const response = await resolve(event);
    return response;
}; 