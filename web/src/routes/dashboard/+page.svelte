<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/services/api';

  /**
   * @type {any[]}
   */
  let containers = [];
  let systemStats = {
    totalContainers: 0,
    runningContainers: 0,
    totalImages: 0,
    cpuUsage: 0,
    memoryUsage: 0,
  };

  let searchQuery = '';
  let statusFilter = 'all';
  let loading = true;
  /**
   * @type {string | null}
   */
  let error = null;

  onMount(async () => {
    try {
      // Fetch containers
      const containersData = await api.containers.list();
      containers = containersData.map(
        (
          /** @type {{ id: any; name: any; status: any; image: any; cpu: any; memory: any; }} */ container,
        ) => ({
          id: container.id,
          name: container.name,
          status: container.status,
          image: container.image,
          cpu: container.cpu || '0%',
          memory: container.memory || '0MB',
        }),
      );

      // Calculate system stats
      systemStats = {
        totalContainers: containers.length,
        runningContainers: containers.filter((c) => c.status === 'running')
          .length,
        totalImages: 8, // This should come from API
        cpuUsage: 35, // This should come from API
        memoryUsage: 45, // This should come from API
      };
    } catch (err) {
      error =
        err instanceof Error ? err.message : 'Failed to load dashboard data';
    } finally {
      loading = false;
    }
  });

  /**
   * @param {any} containerId
   * @param {string} action
   */
  async function handleContainerAction(containerId, action) {
    try {
      // @ts-ignore
      await api.containers[action](containerId);
      // Refresh container list
      const containersData = await api.containers.list();
      containers = containersData;
    } catch (err) {
      error =
        err instanceof Error ? err.message : `Failed to ${action} container`;
    }
  }

  /**
   * @param {string} status
   */
  function getStatusBadgeClass(status) {
    return status === 'running' ? 'badge-success' : 'badge-danger';
  }
</script>

<div class="min-h-screen bg-gray-50 p-4">
  <!-- Dashboard Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Docker Dashboard</h1>
    <p class="text-gray-600">Manage and monitor your Docker containers</p>
  </div>

  {#if error}
    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
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

  <!-- Quick Actions -->
  <div class="flex gap-4 mb-8">
    <button
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      New Container
    </button>
    <button
      class="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors border border-gray-200"
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
      Pull Image
    </button>
  </div>

  <!-- System Overview Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Containers -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="bg-blue-100 p-3 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-400">Total Containers</span>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <h4 class="text-2xl font-bold text-gray-900">
            {systemStats.totalContainers}
          </h4>
          <p class="text-green-600 text-sm font-medium">+2 from last week</p>
        </div>
      </div>
    </div>

    <!-- Running Containers -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="bg-green-100 p-3 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-green-600"
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
        <span class="text-sm font-medium text-gray-400">Running</span>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <h4 class="text-2xl font-bold text-gray-900">
            {systemStats.runningContainers}
          </h4>
          <p class="text-green-600 text-sm font-medium">
            {Math.round(
              (systemStats.runningContainers / systemStats.totalContainers) *
                100,
            )}% active
          </p>
        </div>
      </div>
    </div>

    <!-- CPU Usage -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="bg-purple-100 p-3 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-400">CPU Usage</span>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <h4 class="text-2xl font-bold text-gray-900">
            {systemStats.cpuUsage}%
          </h4>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              class="bg-purple-600 h-2.5 rounded-full"
              style="width: {systemStats.cpuUsage}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory Usage -->
    <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <div class="bg-orange-100 p-3 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-orange-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span class="text-sm font-medium text-gray-400">Memory Usage</span>
      </div>
      <div class="flex items-end justify-between">
        <div>
          <h4 class="text-2xl font-bold text-gray-900">
            {systemStats.memoryUsage}%
          </h4>
          <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              class="bg-orange-600 h-2.5 rounded-full"
              style="width: {systemStats.memoryUsage}%"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Container List -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="p-6 border-b border-gray-100">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h2 class="text-xl font-semibold text-gray-800">Active Containers</h2>
        <div class="flex gap-3">
          <div class="relative">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search containers..."
              class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            bind:value={statusFilter}
            class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
          </select>
        </div>
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center items-center p-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Name</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Status</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Image</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >CPU</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Memory</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Actions</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each containers.filter((c) => (statusFilter === 'all' || c.status === statusFilter) && (c.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) || c.image
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()))) as container}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">
                        {container.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    {container.status === 'running'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'}"
                  >
                    {container.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.image}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.cpu}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.memory}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    {#if container.status === 'running'}
                      <button
                        on:click={() =>
                          handleContainerAction(container.id, 'stop')}
                        class="inline-flex items-center px-3 py-1 border border-yellow-500 text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors"
                      >
                        Stop
                      </button>
                      <button
                        on:click={() =>
                          handleContainerAction(container.id, 'restart')}
                        class="inline-flex items-center px-3 py-1 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Restart
                      </button>
                    {:else}
                      <button
                        on:click={() =>
                          handleContainerAction(container.id, 'start')}
                        class="inline-flex items-center px-3 py-1 border border-green-500 text-green-600 rounded-md hover:bg-green-50 transition-colors"
                      >
                        Start
                      </button>
                    {/if}
                    <button
                      on:click={() =>
                        handleContainerAction(container.id, 'delete')}
                      class="inline-flex items-center px-3 py-1 border border-red-500 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
