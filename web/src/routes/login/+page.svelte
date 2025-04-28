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
      // API call would happen here in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

      // Successful login simulation
      localStorage.setItem('token', 'sample-jwt-token');
      goto('/');
    } catch (err) {
      error = 'Login failed. Please check your credentials.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - DockPilot</title>
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
      Sign In
    </h3>

    {#if error}
      <div
        class="mb-6 bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">{error}</span>
      </div>
    {/if}

    <form class="space-y-6" on:submit|preventDefault={handleLogin}>
      <div>
        <label
          for="email"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >Email</label
        >
        <input
          id="email"
          name="email"
          type="email"
          required
          bind:value={email}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label
          for="password"
          class="text-sm text-gray-700 dark:text-gray-200 font-medium mb-2 block"
          >Password</label
        >
        <input
          id="password"
          name="password"
          type="password"
          required
          bind:value={password}
          class="bg-slate-100 dark:bg-gray-700 w-full text-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-3 rounded-md outline-none border border-transparent focus:border-blue-500 focus:bg-transparent dark:focus:border-blue-500 transition duration-150 ease-in-out"
          placeholder="Enter your password"
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
            Remember me
          </label>
        </div>
        <div class="text-sm">
          <a
            href="#"
            class="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition duration-150 ease-in-out"
          >
            Forgot password?
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
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </div>

      <div class="my-6 flex items-center gap-4">
        <hr class="w-full border-slate-300 dark:border-gray-600" />
        <p
          class="text-sm text-gray-500 dark:text-gray-400 text-center shrink-0"
        >
          or
        </p>
        <hr class="w-full border-slate-300 dark:border-gray-600" />
      </div>

      <p class="text-sm text-gray-700 dark:text-gray-200 mt-8 text-center">
        Don't have an account? <a
          href="/register"
          class="text-blue-600 dark:text-blue-400 font-medium hover:underline ml-1"
          >Register here</a
        >
      </p>

      <!-- Destek Bölümü -->
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Need support? <a
          href="#"
          class="text-blue-600 dark:text-blue-400 hover:underline ml-1"
          >Contact us</a
        >
      </p>
    </form>
  </div>
</div>
