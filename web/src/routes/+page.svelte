<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { browser } from '$app/environment';

  onMount(() => {
    if (browser) {
      if ($auth.isAuthenticated) {
        goto('/dashboard');
      } else {
        goto('/login');
      }
    }
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
</div>
