export const load = async ({ url, cookies }) => {
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(url.pathname);
    const token = cookies.get('token');

    return {
        isPublicRoute,
        hasToken: !!token
    };
}; 