import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Korumalı rotalar
  const protectedRoutes = ['/', '/profile', '/settings'];
  const authRoutes = ['/login', '/register'];
  
  // Kullanıcının token'ını kontrol et
  const token = event.cookies.get('token');
  const isAuthenticated = !!token;
  
  // Kullanıcı giriş yapmamışsa ve korumalı bir rotaya erişmeye çalışıyorsa
  if (!isAuthenticated && protectedRoutes.includes(event.url.pathname)) {
    throw redirect(303, '/login');
  }
  
  // Kullanıcı giriş yapmışsa ve auth rotalarına erişmeye çalışıyorsa
  if (isAuthenticated && authRoutes.includes(event.url.pathname)) {
    throw redirect(303, '/');
  }
  
  return await resolve(event);
} 