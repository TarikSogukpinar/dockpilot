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
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full p-8 sm:p-10">
    <!-- Balina Logosu -->
    <div class="flex justify-center mb-8">
      <svg
        class="h-20 w-20 text-blue-600 dark:text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 2.25c-5.133 0-9.25 2.084-9.25 4.646 0 1.646.98 3.076 2.48 3.854-.3 1.233-.48 2.504-.48 3.791 0 4.746 3.921 8.592 8.75 8.592s8.75-3.846 8.75-8.592c0-1.287-.18-2.558-.48-3.791 1.5-.778 2.48-2.208 2.48-3.854C21.25 4.334 17.133 2.25 12 2.25zm0 1.5c3.867 0 7 1.419 7 3.146s-3.133 3.146-7 3.146-7-1.419-7-3.146S8.133 3.75 12 3.75z M6.5 12.5c0-3.146 2.597-5.702 5.5-5.702s5.5 2.556 5.5 5.702c0 .734-.15 1.44-.42 2.087-.87.19-1.79.29-2.74.29h-.68c-.95 0-1.87-.1-2.74-.29-.27-.647-.42-1.353-.42-2.087z"
        />
      </svg>
    </div>

    <h3
      class="text-slate-900 dark:text-white lg:text-3xl text-2xl font-bold mb-8 text-center"
    >
      Giriş Yap
    </h3>

    {#if error}
      <div
        class="mb-6 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">Hata!</strong>
        <span class="block sm:inline">{error}</span>
      </div>
    {/if}

    <form class="space-y-6" on:submit|preventDefault={handleLogin}>
      <div>
        <label
          for="email"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >E-posta</label
        >
        <input
          id="email"
          name="email"
          type="email"
          required
          bind:value={email}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="E-posta adresinizi girin"
        />
      </div>
      <div>
        <label
          for="password"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >Şifre</label
        >
        <input
          id="password"
          name="password"
          type="password"
          required
          bind:value={password}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Şifrenizi girin"
        />
      </div>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            class="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-gray-600 rounded dark:bg-gray-700"
          />
          <label
            for="remember-me"
            class="ml-2 block text-sm text-gray-700 dark:text-gray-200"
          >
            Beni hatırla
          </label>
        </div>
        <div class="text-sm">
          <a
            href="#"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition duration-150 ease-in-out"
          >
            Şifremi unuttum?
          </a>
        </div>
      </div>

      <div class="!mt-10">
        <button
          type="submit"
          disabled={loading}
          class="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
        >
          {#if loading}
            <svg
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

      <div class="my-6 flex items-center gap-4">
        <hr class="w-full border-slate-300 dark:border-gray-600" />
        <p
          class="text-sm text-gray-500 dark:text-gray-400 text-center shrink-0"
        >
          veya
        </p>
        <hr class="w-full border-slate-300 dark:border-gray-600" />
      </div>

      <p class="text-sm text-gray-700 dark:text-gray-200 mt-8 text-center">
        Hesabınız yok mu? <a
          href="/register"
          class="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1"
          >Buradan kaydolun</a
        >
      </p>

      <!-- Destek Bölümü -->
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Destek mi lazım? <a
          href="#"
          class="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >Bize ulaşın</a
        >
      </p>

      <!-- GitHub Repo Link -->
      <div
        class="flex justify-center items-center mt-4 text-sm text-gray-500 dark:text-gray-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2 fill-current"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          ></path>
        </svg>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          GitHub'da Görüntüle
        </a>
      </div>
    </form>
  </div>
</div>
