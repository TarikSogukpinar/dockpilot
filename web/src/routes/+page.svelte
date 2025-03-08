<script>
  import { onMount } from 'svelte';

  /**
   * @type {any[]}
   */
  let containers = [];
  let loading = true;
  /**
   * @type {null}
   */
  let error = null;
  let searchTerm = '';
  let filterStatus = 'all';
  /**
   * @type {{ name: any; } | null}
   */
  let selectedContainer = null;
  let showLogModal = false;
  /**
   * @type {string | any[]}
   */
  let logs = [];
  let logsLoading = false;

  // Örnek container verileri (API bağlantısı yapılana kadar)
  onMount(async () => {
    try {
      // Gerçek API çağrısı yerine örnek veri
      setTimeout(() => {
        containers = [
          {
            id: 'abc123',
            name: 'nginx-web',
            image: 'nginx:latest',
            state: 'running',
            cpu: '0.5%',
            memory: '128MB / 512MB',
            ports: '80:80, 443:443',
            created: '2 days ago',
          },
          {
            id: 'def456',
            name: 'postgres-db',
            image: 'postgres:14',
            state: 'running',
            cpu: '1.2%',
            memory: '256MB / 1GB',
            ports: '5432:5432',
            created: '5 days ago',
          },
          {
            id: 'ghi789',
            name: 'redis-cache',
            image: 'redis:alpine',
            state: 'stopped',
            cpu: '0%',
            memory: '0MB / 256MB',
            ports: '6379:6379',
            created: '1 week ago',
          },
        ];
        loading = false;
      }, 1000);
    } catch (err) {
      error = err.message;
      loading = false;
    }
  });

  // Filtreleme fonksiyonu
  $: filteredContainers = containers.filter((container) => {
    const matchesSearch =
      container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.image.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || container.state === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Container işlemleri
  /**
   * @param {any} id
   */
  function startContainer(id) {
    console.log(`Starting container ${id}`);
    // API çağrısı yapılacak
  }

  /**
   * @param {any} id
   */
  function stopContainer(id) {
    console.log(`Stopping container ${id}`);
    // API çağrısı yapılacak
  }

  /**
   * @param {any} id
   */
  function restartContainer(id) {
    console.log(`Restarting container ${id}`);
    // API çağrısı yapılacak
  }

  /**
   * @param {{ name: any; ports: string; }} container
   */
  function viewLogs(container) {
    selectedContainer = container;
    showLogModal = true;
    logsLoading = true;

    // Örnek log verileri
    setTimeout(() => {
      logs = [
        `[2023-03-01 12:34:56] Started container ${container.name}`,
        `[2023-03-01 12:34:57] Initializing...`,
        `[2023-03-01 12:34:58] Connected to network bridge`,
        `[2023-03-01 12:34:59] Service started successfully`,
        `[2023-03-01 12:35:00] Listening on port ${container.ports.split(',')[0]}`,
      ];
      logsLoading = false;
    }, 800);
  }

  function closeLogModal() {
    showLogModal = false;
    selectedContainer = null;
    logs = [];
  }
</script>

<div class="min-h-screen bg-gray-100">
  <!-- Navigation -->
  <nav class="bg-slate-800 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex items-center space-x-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-blue-400"
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
          <span class="text-xl font-semibold">DockPilot</span>
        </div>
        <div class="flex items-center">
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 inline mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            </svg>
            Yeni Container
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <!-- Filters and Search -->
    <div
      class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
    >
      <div
        class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto"
      >
        <div class="relative">
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Container ara..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64"
          />
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <select
          bind:value={filterStatus}
          class="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="running">Çalışanlar</option>
          <option value="stopped">Durmuş Olanlar</option>
        </select>
      </div>
      <div class="flex space-x-2 w-full md:w-auto">
        <button
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex-1 md:flex-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clip-rule="evenodd"
            />
          </svg>
          Yenile
        </button>
        <button
          class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium flex-1 md:flex-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          Sistem Bilgisi
        </button>
      </div>
    </div>

    <!-- Dashboard Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Toplam Container</p>
            <p class="text-2xl font-semibold">{containers.length}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-500 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Çalışan</p>
            <p class="text-2xl font-semibold">
              {containers.filter((c) => c.state === 'running').length}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-500 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">Durmuş</p>
            <p class="text-2xl font-semibold">
              {containers.filter((c) => c.state === 'stopped').length}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p class="text-gray-500 text-sm">CPU Kullanımı</p>
            <p class="text-2xl font-semibold">1.7%</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Container Health Monitoring Panel -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-medium mb-4">Container Sağlık Durumu</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredContainers
          .filter((c) => c.state === 'running')
          .slice(0, 3) as container}
          <div class="border rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium">{container.name}</h3>
              <span
                class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                >Çalışıyor</span
              >
            </div>

            <!-- CPU Usage -->
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{container.cpu}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  style="width: {parseFloat(container.cpu)}%"
                ></div>
              </div>
            </div>

            <!-- Memory Usage -->
            <div class="mb-3">
              <div class="flex justify-between text-sm mb-1">
                <span>Bellek</span>
                <span>{container.memory}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-purple-600 h-2 rounded-full"
                  style="width: {parseInt(container.memory) / 5}%"
                ></div>
              </div>
            </div>

            <div class="flex justify-end mt-2">
              <button
                on:click={() => viewStats(container)}
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Detaylı İstatistikler
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Docker Compose Management -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium">Docker Compose Projeleri</h2>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 inline mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          Yeni Proje
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Proje Adı
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Durum
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Containerlar
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Oluşturulma
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  Web Uygulaması
                </div>
                <div class="text-sm text-gray-500">
                  /home/user/projects/webapp
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Çalışıyor
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">3 container</div>
                <div class="text-xs text-gray-500">
                  webapp-db, webapp-api, webapp-nginx
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                2 gün önce
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    class="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-1 rounded"
                    title="Yeniden Başlat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-1 rounded"
                    title="Durdur"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    class="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-1 rounded"
                    title="Düzenle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  Veritabanı Kümesi
                </div>
                <div class="text-sm text-gray-500">
                  /home/user/projects/db-cluster
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                >
                  Durmuş
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">2 container</div>
                <div class="text-xs text-gray-500">
                  postgres-master, postgres-slave
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                1 hafta önce
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    class="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-1 rounded"
                    title="Başlat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    class="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-1 rounded"
                    title="Düzenle"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>
    {:else if error}
      <div
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      >
        <p class="font-bold">Hata!</p>
        <p>{error}</p>
      </div>
    {:else if filteredContainers.length === 0}
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 class="text-lg font-medium mt-4">Container bulunamadı</h3>
        <p class="text-gray-500 mt-2">
          Arama kriterlerinize uygun container bulunamadı.
        </p>
      </div>
    {:else}
      <!-- Container Table -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Container
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Durum
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
              >
                Image
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
              >
                CPU / Bellek
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
              >
                Portlar
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredContainers as container}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {container.name}
                      </div>
                      <div class="text-sm text-gray-500">
                        {container.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      container.state === 'running'
                        ? 'bg-green-100 text-green-800'
                        : container.state === 'stopped'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {container.state === 'running' ? 'Çalışıyor' : 'Durmuş'}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div class="text-sm text-gray-900">{container.image}</div>
                  <div class="text-xs text-gray-500">{container.created}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div class="text-sm text-gray-900">{container.cpu}</div>
                  <div class="text-sm text-gray-500">{container.memory}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  <div class="text-sm text-gray-900">{container.ports}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    {#if container.state === 'running'}
                      <button
                        on:click={() => stopContainer(container.id)}
                        class="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 p-1 rounded"
                        title="Durdur"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        on:click={() => restartContainer(container.id)}
                        class="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 p-1 rounded"
                        title="Yeniden Başlat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    {:else}
                      <button
                        on:click={() => startContainer(container.id)}
                        class="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 p-1 rounded"
                        title="Başlat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    {/if}
                    <button
                      on:click={() => viewLogs(container)}
                      class="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 p-1 rounded"
                      title="Logları Görüntüle"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      class="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-1 rounded"
                      title="Detaylar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fill-rule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </main>
</div>

<!-- Log Modal -->
{#if showLogModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col"
    >
      <div
        class="px-6 py-4 border-b border-gray-200 flex justify-between items-center"
      >
        <h3 class="text-lg font-medium">
          {selectedContainer.name} Logları
        </h3>
        <button
          on:click={closeLogModal}
          class="text-gray-400 hover:text-gray-500"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto flex-grow">
        {#if logsLoading}
          <div class="flex justify-center items-center h-32">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
            ></div>
          </div>
        {:else if logs.length === 0}
          <p class="text-gray-500 text-center">Log bulunamadı</p>
        {:else}
          <div
            class="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-x-auto"
          >
            {#each logs as log}
              <div class="py-1">{log}</div>
            {/each}
          </div>
        {/if}
      </div>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          on:click={closeLogModal}
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
        >
          Kapat
        </button>
      </div>
    </div>
  </div>
{/if}
