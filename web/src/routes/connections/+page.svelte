<script>
  let connections = [
    {
      id: '1',
      name: 'Local Docker',
      host: 'unix:///var/run/docker.sock',
      status: 'connected',
      containers: 5,
      images: 12,
    },
    {
      id: '2',
      name: 'Production Server',
      host: 'tcp://192.168.1.100:2375',
      status: 'disconnected',
      containers: 8,
      images: 15,
    },
  ];

  let showNewConnectionModal = false;

  /**
   * @param {string} status
   */
  function getStatusBadgeClass(status) {
    return status === 'connected' ? 'badge-success' : 'badge-danger';
  }

  function toggleNewConnectionModal() {
    showNewConnectionModal = !showNewConnectionModal;
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Docker Connections</h1>
    <button class="btn btn-primary" on:click={toggleNewConnectionModal}>
      Add New Connection
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each connections as connection}
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">{connection.name}</h3>
            <p class="text-sm text-gray-500">{connection.host}</p>
          </div>
          <span class="badge {getStatusBadgeClass(connection.status)}">
            {connection.status}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-sm text-gray-600">Containers</div>
            <div class="text-xl font-semibold">{connection.containers}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Images</div>
            <div class="text-xl font-semibold">{connection.images}</div>
          </div>
        </div>

        <div class="flex gap-2">
          {#if connection.status === 'connected'}
            <button class="btn btn-warning flex-1">Disconnect</button>
          {:else}
            <button class="btn btn-success flex-1">Connect</button>
          {/if}
          <button class="btn btn-danger">Delete</button>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if showNewConnectionModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Add New Connection</h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Connection Name
          </label>
          <input
            type="text"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My Docker Server"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Host
          </label>
          <input
            type="text"
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tcp://192.168.1.100:2375"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            TLS Enabled
          </label>
          <div class="flex items-center">
            <input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-600"
              >Enable TLS authentication</span
            >
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            class="btn btn-primary flex-1"
            on:click={toggleNewConnectionModal}
          >
            Add Connection
          </button>
          <button
            class="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
            on:click={toggleNewConnectionModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
