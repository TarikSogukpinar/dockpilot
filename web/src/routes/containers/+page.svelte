<script>
  let containers = [
    {
      id: '1',
      name: 'nginx-web',
      status: 'running',
      image: 'nginx:latest',
      created: '2 days ago',
      ports: '80:80, 443:443',
      networks: ['bridge'],
      volumes: ['/data:/data'],
      cpu: '0.2%',
      memory: '128MB',
      logs: ['[Info] Starting nginx...', '[Info] Ready to handle connections'],
    },
    {
      id: '2',
      name: 'postgres-db',
      status: 'stopped',
      image: 'postgres:14',
      created: '5 days ago',
      ports: '5432:5432',
      networks: ['backend'],
      volumes: ['/var/lib/postgresql/data'],
      cpu: '0%',
      memory: '0MB',
      logs: ['[Error] Failed to start database', '[Info] Shutting down'],
    },
  ];

  /**
   * @type {{ id: string; name: any; status: string; image: any; created: any; ports: any; networks: any[]; volumes: any[]; logs: any; cpu: any; memory: any; } | null}
   */
  let selectedContainer = null;
  let activeTab = 'info';

  /**
   * @param {string} status
   */
  function getStatusBadgeClass(status) {
    return status === 'running' ? 'badge-success' : 'badge-danger';
  }

  /**
   * @param {{ id: string; name: any; status: string; image: any; created: any; ports: any; networks: any[]; volumes: any[]; logs: any; cpu: any; memory: any; } | null} container
   */
  function selectContainer(container) {
    selectedContainer = container;
    activeTab = 'info';
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold">Container Management</h1>
    <button class="btn btn-primary"> Create New Container </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Container List -->
    <div class="lg:col-span-1">
      <div class="card !p-0">
        <div class="p-4 border-b">
          <input
            type="text"
            placeholder="Search containers..."
            class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="divide-y">
          {#each containers as container}
            <div
              class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              class:bg-blue-50={selectedContainer?.id === container.id}
              on:click={() => selectContainer(container)}
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="font-medium">{container.name}</div>
                  <div class="text-sm text-gray-500">{container.image}</div>
                </div>
                <span class="badge {getStatusBadgeClass(container.status)}">
                  {container.status}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Container Details -->
    <div class="lg:col-span-2">
      {#if selectedContainer}
        <div class="card">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">{selectedContainer.name}</h2>
            <div class="flex gap-2">
              {#if selectedContainer.status === 'running'}
                <button class="btn btn-warning">Stop</button>
                <button class="btn btn-primary">Restart</button>
              {:else}
                <button class="btn btn-success">Start</button>
              {/if}
              <button class="btn btn-danger">Delete</button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="border-b mb-6">
            <div class="flex gap-4">
              <button
                class="px-4 py-2 border-b-2 transition-colors"
                class:border-blue-500={activeTab === 'info'}
                class:border-transparent={activeTab !== 'info'}
                on:click={() => (activeTab = 'info')}
              >
                Information
              </button>
              <button
                class="px-4 py-2 border-b-2 transition-colors"
                class:border-blue-500={activeTab === 'logs'}
                class:border-transparent={activeTab !== 'logs'}
                on:click={() => (activeTab = 'logs')}
              >
                Logs
              </button>
              <button
                class="px-4 py-2 border-b-2 transition-colors"
                class:border-blue-500={activeTab === 'stats'}
                class:border-transparent={activeTab !== 'stats'}
                on:click={() => (activeTab = 'stats')}
              >
                Stats
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          {#if activeTab === 'info'}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-gray-600">Image</div>
                <div class="font-medium">{selectedContainer.image}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Created</div>
                <div class="font-medium">{selectedContainer.created}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Ports</div>
                <div class="font-medium">{selectedContainer.ports}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600">Networks</div>
                <div class="font-medium">
                  {selectedContainer.networks.join(', ')}
                </div>
              </div>
              <div class="col-span-2">
                <div class="text-sm text-gray-600">Volumes</div>
                <div class="font-medium">
                  {selectedContainer.volumes.join(', ')}
                </div>
              </div>
            </div>
          {:else if activeTab === 'logs'}
            <div
              class="bg-gray-900 text-gray-100 p-4 rounded-md font-mono text-sm"
            >
              {#each selectedContainer.logs as log}
                <div class="whitespace-pre-wrap">{log}</div>
              {/each}
            </div>
          {:else if activeTab === 'stats'}
            <div class="space-y-4">
              <div>
                <div class="text-sm text-gray-600 mb-1">CPU Usage</div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-blue-600 h-2.5 rounded-full"
                    style="width: {selectedContainer.cpu}"
                  ></div>
                </div>
                <div class="text-sm mt-1">{selectedContainer.cpu}</div>
              </div>
              <div>
                <div class="text-sm text-gray-600 mb-1">Memory Usage</div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    class="bg-green-600 h-2.5 rounded-full"
                    style="width: 45%"
                  ></div>
                </div>
                <div class="text-sm mt-1">{selectedContainer.memory}</div>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="card flex items-center justify-center text-gray-500 h-full">
          Select a container to view details
        </div>
      {/if}
    </div>
  </div>
</div>
