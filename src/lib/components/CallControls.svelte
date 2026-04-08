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
			class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 {$callStore.isAudioEnabled
				? ''
				: 'bg-red-600 hover:bg-red-700'}"
			title={$callStore.isAudioEnabled ? 'Mikrofon aus' : 'Mikrofon an'}
		>
			{#if $callStore.isAudioEnabled}
				🎤 Mikrofon
			{:else}
				🔇 Mikrofon aus
			{/if}
		</button>

		<!-- Kamera Toggle -->
		<button
			onclick={toggleVideo}
			class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 {$callStore.isVideoEnabled
				? ''
				: 'bg-red-600 hover:bg-red-700'}"
			title={$callStore.isVideoEnabled ? 'Kamera aus' : 'Kamera an'}
		>
			{#if $callStore.isVideoEnabled}
				📹 Kamera
			{:else}
				📹 Kamera aus
			{/if}
		</button>

		<!-- Bildschirmfreigabe Toggle -->
		<button
			onclick={toggleScreenShare}
			class="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all {$callStore.isScreenSharing
				? 'bg-green-600 hover:bg-green-700'
				: 'bg-blue-600 hover:bg-blue-700'}"
			title={$callStore.isScreenSharing ? 'Bildschirmfreigabe stoppen' : 'Bildschirm freigeben'}
		>
			🖥️ {$callStore.isScreenSharing ? 'Freigabe aktiv' : 'Bildschirm'}
		</button>

		<!-- Anruf beenden -->
		<button
			onclick={endCall}
			class="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition-all hover:bg-red-700"
			title="Anruf beenden"
		>
			📞 Beenden
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
