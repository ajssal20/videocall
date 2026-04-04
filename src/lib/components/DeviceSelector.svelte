<script>
	import { onMount } from 'svelte';
	import { callStore, actions } from '$lib/stores/callStore.js';
	import {
		getAudioInputDevices,
		getVideoInputDevices,
		getAudioOutputDevices,
		onDeviceChange
	} from '$lib/webrtc/devices.js';
	import { switchDevice } from '$lib/webrtc/media.js';

	let audioDevices = [];
	let videoDevices = [];
	let audioOutputDevices = [];
	let showSelector = false;
	let deviceChangeError = '';

	onMount(async () => {
		// Lade verfügbare Geräte
		audioDevices = await getAudioInputDevices();
		videoDevices = await getVideoInputDevices();
		audioOutputDevices = await getAudioOutputDevices();

		// Setze Standardgeräte
		if (audioDevices.length > 0 && !$callStore.selectedMicrophone) {
			actions.setSelectedMicrophone(audioDevices[0].deviceId);
		}
		if (videoDevices.length > 0 && !$callStore.selectedCamera) {
			actions.setSelectedCamera(videoDevices[0].deviceId);
		}

		// Höre auf Geräteänderungen (USB-Geräte werden ein-/ausgesteckt)
		const removeListener = onDeviceChange(async () => {
			audioDevices = await getAudioInputDevices();
			videoDevices = await getVideoInputDevices();
			audioOutputDevices = await getAudioOutputDevices();
		});

		return () => removeListener();
	});

	async function handleAudioDeviceChange(event) {
		const deviceId = event.target.value;
		actions.setSelectedMicrophone(deviceId);
		deviceChangeError = '';

		try {
			if ($callStore.localStream) {
				await switchDevice($callStore.localStream, 'audio', deviceId);
			}
		} catch (err) {
			deviceChangeError = err.message;
		}
	}

	async function handleVideoDeviceChange(event) {
		const deviceId = event.target.value;
		actions.setSelectedCamera(deviceId);
		deviceChangeError = '';

		try {
			if ($callStore.localStream && !$callStore.isScreenSharing) {
				await switchDevice($callStore.localStream, 'video', deviceId);
			}
		} catch (err) {
			deviceChangeError = err.message;
		}
	}

	function handleAudioOutputChange(event) {
		const deviceId = event.target.value;
		actions.setSelectedAudioOutput(deviceId);
		// Audio-Ausgabe wird auf einem <audio>-Element oder am Peer-Connection angewendet
	}
</script>

<div class="flex flex-col gap-4">
	<button
		on:click={() => (showSelector = !showSelector)}
		class="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-600"
	>
		⚙️ {showSelector ? 'Ausblenden' : 'Geräte'}
	</button>

	{#if showSelector}
		<div class="space-y-4 rounded-lg bg-gray-800 p-4">
			{#if deviceChangeError}
				<div class="rounded-lg bg-red-900 p-3 text-sm text-red-100">{deviceChangeError}</div>
			{/if}

			<!-- Mikrofon Auswahl -->
			{#if audioDevices.length > 0}
				<div class="flex flex-col gap-2">
					<label for="audio-input" class="text-sm font-semibold text-gray-100">Mikrofon</label>
					<select
						id="audio-input"
						value={$callStore.selectedMicrophone || audioDevices[0]?.deviceId}
						on:change={handleAudioDeviceChange}
						class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
					>
						{#each audioDevices as device (device.deviceId)}
							<option value={device.deviceId}>{device.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			<!-- Kamera Auswahl -->
			{#if videoDevices.length > 0}
				<div class="flex flex-col gap-2">
					<label for="video-input" class="text-sm font-semibold text-gray-100">Kamera</label>
					<select
						id="video-input"
						value={$callStore.selectedCamera || videoDevices[0]?.deviceId}
						on:change={handleVideoDeviceChange}
						disabled={$callStore.isScreenSharing}
						class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white disabled:opacity-50"
					>
						{#each videoDevices as device (device.deviceId)}
							<option value={device.deviceId}>{device.label}</option>
						{/each}
					</select>
					{#if $callStore.isScreenSharing}
						<p class="text-xs text-gray-400">Während Bildschirmfreigabe deaktiviert</p>
					{/if}
				</div>
			{/if}

			<!-- Audio-Ausgabe Auswahl (sofern unterstützt) -->
			{#if audioOutputDevices.length > 0}
				<div class="flex flex-col gap-2">
					<label for="audio-output" class="text-sm font-semibold text-gray-100">Lautsprecher</label>
					<select
						id="audio-output"
						value={$callStore.selectedAudioOutput || audioOutputDevices[0]?.deviceId}
						on:change={handleAudioOutputChange}
						class="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white"
					>
						{#each audioOutputDevices as device (device.deviceId)}
							<option value={device.deviceId}>{device.label}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if audioDevices.length === 0 && videoDevices.length === 0}
				<p class="text-sm text-gray-400">Keine Geräte verfügbar. Bitte überprüfen Sie Ihre Berechtigungen.</p>
			{/if}
		</div>
	{/if}
</div>
