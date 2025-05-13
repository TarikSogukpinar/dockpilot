<script>
  // @ts-nocheck

  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { config, getApiUrl } from '$lib/config';
  import { api } from '$lib/services/api';
  import { goto } from '$app/navigation';

  // Auth store değişiklikleri için reaktif deyim
  $: console.log('Auth store in profile page:', { 
    isAuthenticated: $auth.isAuthenticated,
    hasToken: !!$auth.token,
    hasUser: !!$auth.user
  });

  let profileData = {
    name: '',
    email: '',
    role: '',
    company: '',
    phone: '',
    avatar: '',
    theme: 'light',
    language: 'tr',
  };

  let loading = true;
  let saveLoading = false;
  /**
   * @type {string | null}
   */
  let error = null;
  /**
   * @type {string | null}
   */
  let successMessage = null;

  onMount(async () => {
    console.log('Profile page onMount starting');
    try {
      loading = true;
      
      // Auth store'dan kullanıcı bilgilerini al
      if ($auth.user) {
        console.log('Setting profile data from auth store:', $auth.user);
        profileData.name = $auth.user.name || '';
        profileData.email = $auth.user.email || '';
        profileData.role = $auth.user.role || 'user';
      } else {
        console.warn('No user data in auth store, might redirect to login');
      }

      // API'den kullanıcı profil bilgilerini al
      if ($auth.token) {
        try {
          console.log('Fetching profile data from API with token:', $auth.token.substring(0, 15) + '...');
          // api/v1/users/me endpoint'ini kullan
          const userData = await api.auth.me();
          console.log('User profile data from API:', userData);

          // API'den gelen bilgilerle profil datasını güncelle
          if (userData) {
            profileData = {
              ...profileData,
              name: userData.name || profileData.name,
              email: userData.email || profileData.email,
              role: userData.role || profileData.role,
              // Profil alanları kullanılabilirlik kontrolü ile alınır
              company: userData?.profile?.company || '',
              phone: userData?.profile?.phone || '',
              avatar: userData?.profile?.avatarUrl || '',
              theme: userData?.profile?.theme || 'light',
              language: userData?.profile?.language || 'tr',
            };
            
            // Auth store'u güncelle
            if ($auth.user) {
              auth.updateUser({
                ...$auth.user,
                name: userData.name || $auth.user.name,
                email: userData.email || $auth.user.email,
                role: userData.role || $auth.user.role
              });
            }
            
            console.log('Profile data updated successfully');
          }
        } catch (apiError) {
          console.error('API Error:', apiError);
          error = apiError instanceof Error ? apiError.message : 'Failed to load profile data';
        }
      } else {
        console.error('No token available for API call');
        error = 'Unable to authenticate. Please try logging in again.';
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
      error =
        err instanceof Error ? err.message : 'Failed to load profile data';
    } finally {
      loading = false;
      console.log('Profile page loading completed');
    }
  });

  async function handleSaveProfile() {
    try {
      saveLoading = true;
      successMessage = null;
      error = null;

      // Profil güncelleme API'si - API servisini kullan
      const profileUpdateData = {
        name: profileData.name,
        company: profileData.company,
        phone: profileData.phone,
        theme: profileData.theme,
        language: profileData.language
      };
      
      const response = await api.users.updateProfile(profileUpdateData);
      
      // Auth store'daki kullanıcı bilgilerini güncelle
      if ($auth.user) {
        auth.updateUser({
          ...$auth.user,
          name: profileData.name,
        });
      }

      successMessage = 'Profil başarıyla güncellendi';
    } catch (err) {
      console.error('Profile update error:', err);
      error = err instanceof Error ? err.message : 'Profil güncellenemedi';
    } finally {
      saveLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800">Profilim</h1>
    <p class="text-gray-600">Hesap bilgilerinizi ve tercihlerinizi yönetin</p>
  </div>

  {#if loading}
    <div class="flex justify-center items-center p-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
      ></div>
    </div>
  {:else}
    <!-- Notification Messages -->
    {#if error}
      <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    {#if successMessage}
      <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Sidebar -->
      <div class="md:col-span-1">
        <div class="bg-white shadow-sm rounded-lg p-6 sticky top-6">
          <div class="flex flex-col items-center">
            {#if profileData.avatar}
              <img
                src={profileData.avatar}
                alt="Profile"
                class="h-24 w-24 rounded-full object-cover mb-4"
              />
            {:else}
              <div
                class="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4"
              >
                <span class="text-2xl font-bold text-blue-600"
                  >{profileData.name
                    ? profileData.name.charAt(0).toUpperCase()
                    : 'U'}</span
                >
              </div>
            {/if}
            <h3 class="text-lg font-medium text-gray-900">
              {profileData.name || 'Kullanıcı'}
            </h3>
            <p class="text-sm text-gray-500">{profileData.email}</p>
            <span
              class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize"
            >
              {profileData.role}
            </span>
          </div>

          <div class="mt-6 border-t border-gray-200 pt-4">
            <nav class="space-y-2">
              <a
                href="#personal-info"
                class="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Kişisel Bilgiler
              </a>
              <a
                href="#preferences"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Tercihler
              </a>
              <a
                href="#security"
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Güvenlik
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="md:col-span-3 space-y-6">
        <!-- Personal Information Section -->
        <div
          id="personal-info"
          class="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Kişisel Bilgiler</h2>
            <p class="mt-1 text-sm text-gray-500">
              Profil bilgilerinizi güncelleyin
            </p>
          </div>

          <div class="p-6">
            <form
              on:submit|preventDefault={handleSaveProfile}
              class="space-y-6"
            >
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700">İsim</label
                >
                <input
                  type="text"
                  id="name"
                  bind:value={profileData.name}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  for="email"
                  class="block text-sm font-medium text-gray-700">Email</label
                >
                <input
                  type="email"
                  id="email"
                  value={profileData.email}
                  disabled
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm cursor-not-allowed"
                />
                <p class="mt-1 text-xs text-gray-500">
                  Email adresinizi değiştiremezsiniz
                </p>
              </div>

              <div>
                <label
                  for="company"
                  class="block text-sm font-medium text-gray-700">Şirket</label
                >
                <input
                  type="text"
                  id="company"
                  bind:value={profileData.company}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  for="phone"
                  class="block text-sm font-medium text-gray-700">Telefon</label
                >
                <input
                  type="tel"
                  id="phone"
                  bind:value={profileData.phone}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div class="pt-4">
                <button
                  type="submit"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={saveLoading}
                >
                  {#if saveLoading}
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
                    Kaydediliyor...
                  {:else}
                    Kaydet
                  {/if}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Preferences Section -->
        <div
          id="preferences"
          class="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Tercihler</h2>
            <p class="mt-1 text-sm text-gray-500">
              Uygulama ayarlarınızı özelleştirin
            </p>
          </div>

          <div class="p-6">
            <div class="space-y-6">
              <div>
                <label
                  for="theme"
                  class="block text-sm font-medium text-gray-700">Tema</label
                >
                <select
                  id="theme"
                  bind:value={profileData.theme}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="light">Açık Tema</option>
                  <option value="dark">Koyu Tema</option>
                  <option value="system">Sistem Teması</option>
                </select>
              </div>

              <div>
                <label
                  for="language"
                  class="block text-sm font-medium text-gray-700">Dil</label
                >
                <select
                  id="language"
                  bind:value={profileData.language}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div class="pt-4">
                <button
                  type="button"
                  on:click={handleSaveProfile}
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={saveLoading}
                >
                  {#if saveLoading}
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
                    Kaydediliyor...
                  {:else}
                    Tercihleri Kaydet
                  {/if}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div
          id="security"
          class="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Güvenlik</h2>
            <p class="mt-1 text-sm text-gray-500">
              Şifrenizi ve güvenlik ayarlarınızı yönetin
            </p>
          </div>

          <div class="p-6">
            <div class="space-y-6">
              <div>
                <h3 class="text-sm font-medium text-gray-700">
                  Şifre Değişikliği
                </h3>
                <button
                  type="button"
                  class="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Şifremi Değiştir
                </button>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-700">
                  İki Faktörlü Doğrulama
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Hesabınızı daha güvenli hale getirmek için iki faktörlü
                  doğrulamayı etkinleştirin
                </p>

                <div class="mt-3 flex items-center justify-between">
                  <div class="flex items-center">
                    <button
                      type="button"
                      class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-200"
                      role="switch"
                      aria-checked="false"
                    >
                      <span
                        aria-hidden="true"
                        class="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                      ></span>
                    </button>
                    <span class="ml-3 text-sm text-gray-500">Devre Dışı</span>
                  </div>
                  <button
                    type="button"
                    class="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Daha Fazla Bilgi
                  </button>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <h3 class="text-sm font-medium text-gray-700">
                  Oturum Açma Aktivitesi
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Son giriş aktivitelerinizi görüntüleyin
                </p>

                <button
                  type="button"
                  class="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Aktiviteleri Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
