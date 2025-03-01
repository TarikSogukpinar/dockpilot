<script>
  import '../app.css';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  const publicPaths = ['/', '/login', '/register'];
  
  $: if (!$auth.isAuthenticated && !publicPaths.includes($page.url.pathname)) {
    goto('/login');
  }

  function handleLogout() {
    auth.logout();
    goto('/login');
  }
</script>

<div class="min-h-screen bg-gray-50">
  {#if $auth.isAuthenticated}
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-blue-600">DockPilot</span>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a 
                href="/dashboard" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                class:border-blue-500={$page.url.pathname === '/dashboard'}
                class:text-gray-900={$page.url.pathname === '/dashboard'}
              >
                Dashboard
              </a>
              <a 
                href="/containers" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                class:border-blue-500={$page.url.pathname === '/containers'}
                class:text-gray-900={$page.url.pathname === '/containers'}
              >
                Containers
              </a>
              <a 
                href="/images" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                class:border-blue-500={$page.url.pathname === '/images'}
                class:text-gray-900={$page.url.pathname === '/images'}
              >
                Images
              </a>
              <a 
                href="/connections" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                class:border-blue-500={$page.url.pathname === '/connections'}
                class:text-gray-900={$page.url.pathname === '/connections'}
              >
                Connections
              </a>
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-4">{$auth.user?.email}</span>
            <button 
              on:click={handleLogout}
              class="text-gray-500 hover:text-gray-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  {/if}

  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <slot />
  </main>
</div>
