<script>
	import { callStore, actions } from '$lib/stores/callStore.js';
	import { getScreenShare, replaceVideoTrack } from '$lib/webrtc/media.js';

	let { onEndCall } = $props();

	let screenShareError = $state('');

	async function toggleAudio() {
		actions.toggleAudio();
	}

	async function toggleVideo() {
		actions.toggleVideo();
	}

	async function toggleScreenShare() {
		try {
			screenShareError = '';

			if ($callStore.isScreenSharing) {
				// Bildschirmfreigabe stoppen, zurück zu Kamera
				if ($callStore.localStream) {
					const screenTrack = $callStore.localStream.getVideoTracks()[0];
					if (screenTrack && screenTrack.label.includes('screen')) {
						screenTrack.stop();
						$callStore.localStream.removeTrack(screenTrack);

						// Zurück zu Kamera - neue Kamera erlauben
						const cameraConstraints = {
							video: {
								width: { ideal: 1280 },
								height: { ideal: 720 }
							}
						};
						const cameraStream = await navigator.mediaDevices.getUserMedia(cameraConstraints);
						const cameraTrack = cameraStream.getVideoTracks()[0];

						replaceVideoTrack($callStore.localStream, cameraTrack);

						// Track auch in WebRTC senden
						if ($callStore.peerConnection) {
							const sender = $callStore.peerConnection
								.getSenders()
								.find((s) => s.track && s.track.kind === 'video');
							if (sender) {
								await sender.replaceTrack(cameraTrack);
							}
						}
					}
				}
				actions.setScreenSharing(false);
			} else {
				// Bildschirmfreigabe starten
				try {
					const screenStream = await getScreenShare();
					const screenTrack = screenStream.getVideoTracks()[0];

					if ($callStore.localStream) {
						replaceVideoTrack($callStore.localStream, screenTrack);

						// Track auch in WebRTC senden
						if ($callStore.peerConnection) {
							const sender = $callStore.peerConnection
								.getSenders()
								.find((s) => s.track && s.track.kind === 'video');
							if (sender) {
								await sender.replaceTrack(screenTrack);
							}
						}
					}
					actions.setScreenSharing(true);

					// Listener für Stop-Button des Browsers
					screenTrack.addEventListener('ended', () => {
						toggleScreenShare();
					});
				} catch (err) {
					screenShareError = err.message;
				}
			}
		} catch (err) {
			screenShareError = err.message;
		}
	}

	async function endCall() {
		if (typeof onEndCall === 'function') {
			await onEndCall();
		}
	}
</script>

<div class="flex flex-col items-center gap-4 rounded-lg bg-gray-800 p-6 shadow-lg">
	{#if screenShareError}
		<div class="w-full rounded-lg bg-red-900 p-3 text-red-100">{screenShareError}</div>
	{/if}

	<div class="flex flex-wrap justify-center gap-3">
		<!-- Mikrofon Toggle -->
		<button
			onclick={toggleAudio}
			class="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 transform hover:scale-105 {$callStore.isAudioEnabled
				? ''
				: 'from-pink-600 to-pink-700 hover:shadow-pink-500/25'}"
			title={$callStore.isAudioEnabled ? 'Mikrofon aus' : 'Mikrofon an'}
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if $callStore.isAudioEnabled}
					<span class="animate-pulse">🎤</span> Mikrofon
				{:else}
					<span>🔇</span> Mikrofon aus
				{/if}
			</span>
			<div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 {$callStore.isAudioEnabled ? '' : 'from-pink-400 to-pink-500'}"></div>
		</button>

		<!-- Kamera Toggle -->
		<button
			onclick={toggleVideo}
			class="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 transform hover:scale-105 {$callStore.isVideoEnabled
				? ''
				: 'from-pink-600 to-pink-700 hover:shadow-pink-500/25'}"
			title={$callStore.isVideoEnabled ? 'Kamera aus' : 'Kamera an'}
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if $callStore.isVideoEnabled}
					<span class="animate-pulse">📹</span> Kamera
				{:else}
					<span>📹</span> Kamera aus
				{/if}
			</span>
			<div class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 {$callStore.isVideoEnabled ? '' : 'from-pink-400 to-pink-500'}"></div>
		</button>

		<!-- Bildschirmfreigabe Toggle -->
		<button
			onclick={toggleScreenShare}
			class="group relative overflow-hidden inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:scale-105 {$callStore.isScreenSharing
				? 'from-purple-600 to-purple-700 hover:shadow-purple-500/25'
				: 'from-yellow-600 to-yellow-700 hover:shadow-yellow-500/25'}"
			title={$callStore.isScreenSharing ? 'Bildschirmfreigabe stoppen' : 'Bildschirm freigeben'}
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if $callStore.isScreenSharing}
					<span class="animate-bounce">🖥️</span> Freigabe aktiv
				{:else}
					<span>🖥️</span> Bildschirm
				{/if}
			</span>
			<div class="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 {$callStore.isScreenSharing ? 'from-purple-400 to-purple-500' : 'from-yellow-400 to-yellow-500'}"></div>
		</button>

		<!-- Anruf beenden -->
		<button
			onclick={endCall}
			class="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-700 to-purple-800 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
			title="Anruf beenden"
		>
			<span class="relative z-10 flex items-center gap-2">
				<span>📞</span> Beenden
			</span>
			<div class="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
		</button>
	</div>

	<!-- Zusätzliche Info -->
	<div class="mt-2 text-sm text-gray-300">
		{#if $callStore.connectionState === 'connected'}
			<p>🔗 Verbunden</p>
		{:else if $callStore.connectionState === 'joining'}
			<p>⏳ Verbindung wird aufgebaut...</p>
		{:else}
			<p>⚠️ Verbindungsstatus: {$callStore.connectionState}</p>
		{/if}
	</div>
</div>
