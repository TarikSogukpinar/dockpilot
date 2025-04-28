<script>
  import { goto } from '$app/navigation';

  let fullName = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let loading = false;
  /**
   * @type {string | null}
   */
  let error = null;

  async function handleRegister() {
    loading = true;
    error = null;

    if (password !== confirmPassword) {
      error = 'Şifreler eşleşmiyor.';
      loading = false;
      return;
    }

    try {
      // Gerçek uygulamada burada API çağrısı yapılır
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simüle edilmiş gecikme

      // Başarılı kayıt simülasyonu
      goto('/login');
    } catch (err) {
      error = 'Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Kayıt Ol - DockPilot</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full p-8 sm:p-10">
    <!-- Logo Yok -->

    <h3
      class="text-slate-900 dark:text-white lg:text-3xl text-2xl font-bold mb-8 text-center"
    >
      Hesap Oluştur
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

    <form class="space-y-6" on:submit|preventDefault={handleRegister}>
      <div>
        <label
          for="fullName"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >Ad Soyad</label
        >
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          bind:value={fullName}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Adınızı ve soyadınızı girin"
        />
      </div>

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
          autocomplete="email"
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
          placeholder="Şifrenizi oluşturun"
        />
      </div>

      <div>
        <label
          for="confirmPassword"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >Şifre Tekrar</label
        >
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          bind:value={confirmPassword}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Şifrenizi tekrar girin"
        />
      </div>

      <div class="flex items-center pt-1">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          class="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-gray-600 rounded dark:bg-gray-700"
        />
        <label
          for="terms"
          class="ml-2 block text-sm text-gray-700 dark:text-gray-200"
        >
          <span
            >Kullanım şartlarını ve gizlilik politikasını kabul ediyorum</span
          >
        </label>
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
            Kayıt Yapılıyor...
          {:else}
            Kayıt Ol
          {/if}
        </button>
      </div>
    </form>

    <div class="my-6 flex items-center gap-4">
      <hr class="w-full border-slate-300 dark:border-gray-600" />
      <p class="text-sm text-gray-500 dark:text-gray-400 text-center shrink-0">
        veya
      </p>
      <hr class="w-full border-slate-300 dark:border-gray-600" />
    </div>

    <p class="text-sm text-gray-700 dark:text-gray-200 mt-8 text-center">
      Zaten hesabınız var mı? <a
        href="/login"
        class="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1"
        >Giriş Yapın</a
      >
    </p>
  </div>
</div>
