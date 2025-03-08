<script>
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let rememberMe = false;
  let loading = false;
  /**
   * @type {string | null}
   */
  let error = null;

  async function handleLogin() {
    loading = true;
    error = null;

    try {
      // Gerçek uygulamada burada API çağrısı yapılır
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simüle edilmiş gecikme

      // Başarılı giriş simülasyonu
      localStorage.setItem('token', 'sample-jwt-token');
      goto('/');
    } catch (err) {
      error = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Giriş Yap - DockPilot</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
    <div class="bg-slate-800 py-6">
      <div class="flex justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      </div>
      <h2 class="mt-2 text-center text-2xl font-bold text-white">
        DockPilot'a Hoş Geldiniz
      </h2>
      <p class="mt-2 text-center text-sm text-gray-300">
        Docker konteynerlerinizi yönetmek için giriş yapın
      </p>
    </div>

    <div class="p-8">
      {#if error}
        <div
          class="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
        >
          <p>{error}</p>
        </div>
      {/if}

      <form class="space-y-6" on:submit|preventDefault={handleLogin}>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            E-posta Adresi
          </label>
          <div class="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ornek@email.com"
            />
          </div>
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Şifre
          </label>
          <div class="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              bind:value={password}
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              bind:checked={rememberMe}
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Beni hatırla
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              Şifremi unuttum
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if loading}
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Giriş Yapılıyor...
            {:else}
              Giriş Yap
            {/if}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500"> Hesabınız yok mu? </span>
          </div>
        </div>

        <div class="mt-6">
          <a
            href="/register"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hesap Oluştur
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
