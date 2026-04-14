<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { callStore, actions } from '$lib/stores/callStore.js';
	import * as peer from '$lib/webrtc/peer.js';
	import * as media from '$lib/webrtc/media.js';
	import * as devices from '$lib/webrtc/devices.js';
	import * as signaling from '$lib/webrtc/signaling.js';
	import VideoPanel from '$lib/components/VideoPanel.svelte';
	import CallControls from '$lib/components/CallControls.svelte';
	import DeviceSelector from '$lib/components/DeviceSelector.svelte';
	import FilterSelector from '$lib/components/FilterSelector.svelte';

	let { data } = $props();

	const roomCode = $derived(data.roomCode);

	let isInitiator = false;
	let copyStatusCode = $state('');
	let mediaError = $state('');
	let connectionTimeoutId = null;
	let pendingIceCandidates = [];

	function getSignalingUrl() {
		const signalingUrl = import.meta.env.VITE_SIGNALING_URL?.trim();
		if (signalingUrl) {
			return signalingUrl;
		}

		if (typeof window !== 'undefined') {
			const { hostname } = window.location;
			if (hostname === 'localhost' || hostname === '127.0.0.1') {
				return 'http://localhost:3000';
			}
		}

		throw new Error(
			'VITE_SIGNALING_URL ist nicht gesetzt. Bitte konfigurieren Sie die Signaling-Server-URL in den Vercel Environment Variables.'
		);
	}

	async function flushPendingIceCandidates() {
		const peerConnection = $callStore.peerConnection;
		if (!peerConnection || pendingIceCandidates.length === 0) return;

		const candidates = pendingIceCandidates;
		pendingIceCandidates = [];

		for (const candidate of candidates) {
			await peer.addIceCandidate(peerConnection, candidate);
		}
	}

	onMount(async () => {
		try {
			// Setze den Raumcode
			actions.setRoomCode(roomCode);
			actions.setConnectionState('joining');

			// Prüfe ob der Browser Media APIs unterstützt
			if (!devices.isMediaSupported()) {
				throw new Error('Ihr Browser unterstützt keine Kamera/Mikrofon-Zugriff');
			}

			// Fordere Medienzugriff an
			try {
				const audioDeviceId = await devices.getDefaultAudioInputDevice();
				const videoDeviceId = await devices.getDefaultVideoInputDevice();

				const localStream = await media.getMediaStream(audioDeviceId, videoDeviceId);
				actions.setLocalStream(localStream);
				actions.setSelectedMicrophone(audioDeviceId);
				actions.setSelectedCamera(videoDeviceId);
			} catch (err) {
				mediaError = err.message || 'Kamera/Mikrofon konnte nicht aufgerufen werden';
				actions.setError(mediaError);
				actions.setConnectionState('error');
				setTimeout(() => {
					goto('/');
				}, 3000);
				return;
			}

			// Verbinde mit Signaling-Server
			try {
				await signaling.connectToSignalingServer(getSignalingUrl(), {
					onConnect: () => {
						console.log('Mit Signaling-Server verbunden');
						isInitiator = false;

						// Betrete den Raum
						signaling.joinRoom(roomCode);
					},
					onDisconnect: () => {
						console.log('Von Signaling-Server getrennt');
						actions.setConnectionState('idle');
					},
					onError: (err) => {
						console.error('Signaling-Fehler:', err);
						mediaError = 'Signaling-Verbindung fehlgeschlagen';
						actions.setError(mediaError);
					},
					onRoomFull: () => {
						actions.setConnectionState('full');
						mediaError = 'Raum ist voll (maximal 2 Teilnehmer)';
						actions.setError(mediaError);
						setTimeout(() => {
							goto('/');
						}, 3000);
					},
					onRoomJoined: (data) => {
						isInitiator = data.isInitiator;
						actions.setParticipantCount(data.participantCount || 1);
					},
					onUserJoined: async () => {
						// Ein zweiter Teilnehmer hat den Raum betreten
						actions.setParticipantCount(2);

						if (isInitiator) {
							// Erstelle Peer-Verbindung für den Initiator
							try {
								const peerConnection = peer.createPeerConnection();
								actions.setPeerConnection(peerConnection);

								const localStream = $callStore.localStream;
								peer.addStreamToPeer(peerConnection, localStream);

								peer.setupPeerEventHandlers(peerConnection, {
									onIceCandidate: (candidate) => {
										signaling.sendIceCandidate(candidate);
									},
									onTrack: (remoteStream) => {
										actions.setRemoteStream(remoteStream);
									},
									onConnectionStateChange: (state) => {
										if (state === 'connected') {
											actions.setConnectionState('connected');
										}
									}
								});

								const offer = await peer.createOffer(peerConnection);
								signaling.sendOffer(offer);
							} catch (err) {
								console.error('Fehler beim Erstellen des Offers:', err);
								mediaError = err.message;
								actions.setError(mediaError);
							}
						}
					},
					onOffer: async (data) => {
						// Ich bin der Responder - ich habe ein Offer erhalten
						try {
							const peerConnection = peer.createPeerConnection();
							actions.setPeerConnection(peerConnection);

							const localStream = $callStore.localStream;
							peer.addStreamToPeer(peerConnection, localStream);

							peer.setupPeerEventHandlers(peerConnection, {
								onIceCandidate: (candidate) => {
									signaling.sendIceCandidate(candidate);
								},
								onTrack: (remoteStream) => {
									actions.setRemoteStream(remoteStream);
								},
								onConnectionStateChange: (state) => {
									if (state === 'connected') {
										actions.setConnectionState('connected');
									}
								}
							});

							await peer.setRemoteDescription(peerConnection, data.offer);
							await flushPendingIceCandidates();

							const answer = await peer.createAnswer(peerConnection);
							signaling.sendAnswer(answer);
						} catch (err) {
							console.error('Fehler beim Beantworten des Offers:', err);
							mediaError = err.message;
							actions.setError(mediaError);
						}
					},
					onAnswer: async (data) => {
						// Ich bin der Initiator - ich habe ein Answer erhalten
						try {
							const peerConnection = $callStore.peerConnection;
							await peer.setRemoteDescription(peerConnection, data.answer);
							await flushPendingIceCandidates();
						} catch (err) {
							console.error('Fehler beim Verarbeiten des Answers:', err);
							mediaError = err.message;
							actions.setError(mediaError);
						}
					},
					onIceCandidate: async (data) => {
						// Füge ICE-Kandidaten hinzu
						try {
							const peerConnection = $callStore.peerConnection;
							if (!data.candidate) return;

							if (!peerConnection || !peerConnection.remoteDescription) {
								pendingIceCandidates = [...pendingIceCandidates, data.candidate];
								return;
							}

							await peer.addIceCandidate(peerConnection, data.candidate);
						} catch (err) {
							console.error('Fehler beim Hinzufügen des ICE-Kandidaten:', err);
						}
					},
					onUserLeft: () => {
						// Der andere Benutzer hat den Raum verlassen
						actions.setParticipantCount(1);
						actions.setRemoteStream(null);
						actions.setConnectionState('idle');
						mediaError = 'Der andere Benutzer hat den Raum verlassen';
						actions.setError(mediaError);

						// Schließe die Peer-Verbindung
						if ($callStore.peerConnection) {
							peer.closePeerConnection($callStore.peerConnection);
							actions.setPeerConnection(null);
						}
					}
				});
			} catch (err) {
				console.error('Fehler beim Verbindungsaufbau:', err);
				mediaError = err.message || 'Verbindung zum Signaling-Server fehlgeschlagen';
				actions.setError(mediaError);
				actions.setConnectionState('error');
			}

			// Timeout-Management
			connectionTimeoutId = setTimeout(() => {
				if ($callStore.connectionState === 'joining' || $callStore.connectionState === 'idle') {
					// Prüfe wenigstens jede Minute, ob noch jemand kommt
				}
			}, 5 * 60 * 1000); // 5 Minuten

		} catch (err) {
			console.error('Fehler beim Initialisieren:', err);
			mediaError = err.message || 'Initialisierung fehlgeschlagen';
			actions.setError(mediaError);
			setTimeout(() => {
				goto('/');
			}, 3000);
		}
	});

	async function endCall() {
		// Beende den Anruf und kehre zur Landing-Page zurück
		signaling.leaveRoom();
		media.stopMediaStream($callStore.localStream);
		if ($callStore.peerConnection) {
			peer.closePeerConnection($callStore.peerConnection);
		}
		signaling.disconnectSignaling();
		actions.reset();

		clearTimeout(connectionTimeoutId);

		await goto('/');
	}

	function copyRoomCodeToClipboard() {
		navigator.clipboard.writeText(roomCode).then(() => {
			copyStatusCode = '📋 Code kopiert!';
			setTimeout(() => {
				copyStatusCode = '';
			}, 2000);
		});
	}

	onDestroy(() => {
		// Cleanup
		media.stopMediaStream($callStore.localStream);
		if ($callStore.peerConnection) {
			peer.closePeerConnection($callStore.peerConnection);
		}
		signaling.disconnectSignaling();
		clearTimeout(connectionTimeoutId);
	});
</script>

<div class="flex min-h-screen flex-col bg-gray-900 lg:h-screen">
	<!-- Header -->
	<header class="border-b border-gray-700 bg-gray-800 px-4 py-4">
		<div class="mx-auto max-w-7xl">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="text-2xl">📞</div>
					<h1 class="text-xl font-bold text-white">VideoCall - Raum {roomCode}</h1>
				</div>
				<div class="flex items-center gap-4">
					<div class="text-sm">
						<span class="text-gray-400">Teilnehmer:</span>
						<span class="ml-2 font-semibold text-white">{$callStore.participantCount || 1} / 2</span>
					</div>
					<button
						onclick={copyRoomCodeToClipboard}
						class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700"
						title="Code in Zwischenablage kopieren"
					>
						📋 {roomCode}
					</button>
					{#if copyStatusCode}
						<span class="text-xs text-green-400">{copyStatusCode}</span>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
		<div class="mx-auto min-h-full max-w-7xl lg:h-full">
			<div class="grid min-h-full grid-cols-1 gap-4 p-4 lg:h-full lg:grid-cols-4">
				<!-- Video Area (3 Spalten auf Desktop) -->
				<div class="min-h-[50vh] lg:col-span-3 lg:min-h-0">
					<VideoPanel />
				</div>

				<!-- Control Sidebar (1 Spalte auf Desktop) -->
				<div class="min-h-0 space-y-4 pb-4 lg:overflow-y-auto">
					{#if mediaError}
						<div class="rounded-lg bg-red-900 p-4 text-red-100">
							<p class="font-semibold">Fehler</p>
							<p class="text-sm">{mediaError}</p>
						</div>
					{/if}

					<CallControls onEndCall={endCall} />
					<DeviceSelector />
					<FilterSelector />

					<!-- Raum-Info -->
					<div class="rounded-lg bg-gray-800 p-4 text-sm">
						<p class="mb-2 font-semibold text-gray-100">Raum-Code</p>
						<p class="mb-4 break-all rounded-lg bg-gray-700 p-2 font-mono text-white">{roomCode}</p>
						<button
							onclick={copyRoomCodeToClipboard}
							class="w-full rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white transition-all hover:bg-blue-700"
						>
							📋 Code kopieren
						</button>
					</div>

					<!-- Hinweise -->
					<div class="rounded-lg bg-gray-800 p-4 text-xs text-gray-400">
						<p class="mb-2 font-semibold text-gray-100">Hinweise</p>
						<ul class="space-y-1">
							<li>Teilen Sie den Code mit Ihrem Gesprächspartner</li>
							<li>Maximal 2 Personen pro Raum</li>
							<li>Video-/Audio-Quellen wechselbar</li>
							<li>Bildschirmfreigabe möglich</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
