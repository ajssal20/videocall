<script>
	import { callStore, actions } from '$lib/stores/callStore.js';
	import { getAvailableFilters } from '$lib/webrtc/filters.js';

	let filters = getAvailableFilters();
	let showFilters = false;
</script>

<div class="flex flex-col gap-4">
	<button
		on:click={() => (showFilters = !showFilters)}
		class="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-600"
	>
		✨ {showFilters ? 'Ausblenden' : 'Filter'}
	</button>

	{#if showFilters}
		<div class="space-y-4 rounded-lg bg-gray-800 p-4">
			<!-- Filter für lokales Video -->
			<div class="flex flex-col gap-2">
				<label for="local-filter" class="text-sm font-semibold text-gray-100">Mein Video</label>
				<select
					id="local-filter"
					value={$callStore.currentVideoFilter}
					on:change={(e) => actions.setCurrentVideoFilter(e.target.value)}
					class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
				>
					{#each filters as filter (filter.id)}
						<option value={filter.id}>{filter.label}</option>
					{/each}
				</select>
			</div>

			<!-- Filter für Remote-Video -->
			{#if $callStore.remoteStream}
				<div class="flex flex-col gap-2">
					<label for="remote-filter" class="text-sm font-semibold text-gray-100">Video des Anderen</label>
					<select
						id="remote-filter"
						value={$callStore.remoteVideoFilter}
						on:change={(e) => actions.setRemoteVideoFilter(e.target.value)}
						class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
					>
						{#each filters as filter (filter.id)}
							<option value={filter.id}>{filter.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<p class="text-xs text-gray-400">Filter beeinflussen nur die lokale Anzeige</p>
		</div>
	{/if}
</div>
