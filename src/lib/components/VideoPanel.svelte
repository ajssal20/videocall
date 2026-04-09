<script>
	import { callStore } from '$lib/stores/callStore.js';
	import { applyFilter } from '$lib/webrtc/filters.js';

	let localVideoRef = $state();
	let remoteVideoRef = $state();

	async function syncVideoElement(videoElement, stream, filterId) {
		if (!videoElement) return;

		videoElement.srcObject = stream ?? null;
		applyFilter(videoElement, filterId);

		if (stream) {
			try {
				await videoElement.play();
			} catch {
				// Browser können Autoplay mit Audio blockieren; der Stream bleibt trotzdem zugewiesen.
			}
		}
	}

	$effect(() => {
		syncVideoElement(localVideoRef, $callStore.localStream, $callStore.currentVideoFilter);
	});

	$effect(() => {
		syncVideoElement(remoteVideoRef, $callStore.remoteStream, $callStore.remoteVideoFilter);
	});
</script>

<div class="relative h-full w-full bg-gray-900">
	<!-- Remote Video (Hauptbereich) -->
	<div class="absolute inset-0 flex items-center justify-center overflow-hidden">
		{#if $callStore.remoteStream}
			<video
				bind:this={remoteVideoRef}
				class="h-full w-full object-cover"
				autoplay
				playsinline
				muted={false}
			></video>
		{:else}
			<div class="flex flex-col items-center justify-center space-y-4 animate-fade-in">
				<div class="text-6xl animate-bounce">📞</div>
				{#if $callStore.connectionState === 'joining'}
					<p class="text-center text-gray-100 animate-pulse">Verbindung wird aufgebaut...</p>
				{:else if $callStore.connectionState === 'full'}
					<p class="text-center text-red-400 animate-shake">Raum ist voll. Maximal 2 Teilnehmer erlaubt.</p>
				{:else if $callStore.connectionState === 'idle'}
					<p class="text-center text-gray-100">Raum erstellt. Warte auf zweiten Teilnehmer...</p>
				{:else if $callStore.connectionState === 'waiting'}
					<p class="text-center text-gray-100 animate-pulse">Warte auf Teilnehmer...</p>
				{:else if $callStore.connectionState === 'error'}
					<p class="text-center text-red-400 animate-shake">{$callStore.error || 'Verbindungsfehler'}</p>
				{:else}
					<p class="text-center text-gray-100 animate-pulse">Verbindung wird aufgebaut...</p>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Lokales Video (Kleine PiP) -->
	{#if $callStore.localStream}
		<div
			class="absolute bottom-20 right-4 h-32 w-32 overflow-hidden rounded-lg border-2 border-white bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-fade-in"
		>
			<video
				bind:this={localVideoRef}
				class="h-full w-full object-cover"
				autoplay
				playsinline
				muted={true}
			></video>

			<!-- Status-Indikatoren (auf lokalem Video) -->
			<div class="absolute bottom-1 left-1 flex gap-1">
				{#if !$callStore.isAudioEnabled}
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 animate-pulse"
						title="Mikrofon aus"
					>
						<span class="text-xs text-white">🔇</span>
					</div>
				{/if}
				{#if !$callStore.isVideoEnabled}
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 animate-pulse"
						title="Kamera aus"
					>
						<span class="text-xs text-white">📹</span>
					</div>
				{/if}
				{#if $callStore.isScreenSharing}
					<div
						class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 animate-bounce"
						title="Bildschirm wird geteilt"
					>
						<span class="text-xs text-white">🖥️</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	video {
		transform: scaleX(-1);
	}
	@keyframes fade-in {
		from { opacity: 0; transform: scale(0.9); }
		to { opacity: 1; transform: scale(1); }
	}
	.animate-fade-in {
		animation: fade-in 0.5s ease-out;
	}
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	.animate-shake {
		animation: shake 0.5s ease-in-out;
	}
</style>
