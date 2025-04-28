<script>
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const publicPaths = ['/', '/login', '/register'];
  
  // Client-side only navigation
  $: if (browser && !$auth.isAuthenticated && !publicPaths.includes($page.url.pathname)) {
    goto('/login');
  }

  let isLoggedIn = false;
  
  onMount(() => {
    // Gerçek uygulamada burada token kontrolü yapılabilir
    const token = localStorage.getItem('token');
    isLoggedIn = !!token;
  });

  function handleLogout() {
    auth.logout();
    localStorage.removeItem('token');
    if (browser) {
      goto('/login');
    }
  }
</script>

<div class="min-h-screen bg-gray-100 flex flex-col">
  <!-- Navigation - sadece giriş yapılmışsa göster -->
  {#if isLoggedIn && !$page.url.pathname.includes('/login') && !$page.url.pathname.includes('/register')}
    <nav class="bg-slate-800 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <a href="/" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span class="text-xl font-semibold ml-2">DockPilot</span>
            </a>
          </div>
          <div class="flex items-center space-x-4">
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Yeni Container
            </button>
            <div class="relative group">
              <button class="flex items-center text-sm font-medium text-white hover:text-gray-200 focus:outline-none">
                <span>Kullanıcı</span>
                <svg class="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Ayarlar</a>
                <button on:click={handleLogout} class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Çıkış Yap</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  {/if}

  <!-- Page content -->
  <div class="flex-grow">
    <slot />
  </div>

  <!-- Footer - tüm sayfalarda göster -->
  <!-- <footer class="bg-white py-4 shadow-inner mt-auto">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          &copy; 2023 DockPilot. Tüm hakları saklıdır.
        </div>
        <div class="flex space-x-4">
          <a href="#" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">GitHub</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
          <a href="#" class="text-gray-500 hover:text-gray-700">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer> -->
</div>
