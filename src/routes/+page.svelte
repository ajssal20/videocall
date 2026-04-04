<script>
	import { onMount } from 'svelte';
	import JoinRoom from '$lib/components/JoinRoom.svelte';

	let appVersion = '1.0.0';

	onMount(() => {
		// Prüfe PWA-Unterstützung
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js').catch((err) => {
				console.log('Service Worker Registration fehlgeschlagen:', err);
			});
		}
	});
</script>

<div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
	<!-- Header -->
	<header class="border-b border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur">
		<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="text-4xl">📞</div>
					<div>
						<h1 class="text-2xl font-bold text-white">VideoCall</h1>
						<p class="text-sm text-gray-400">Sichere 1-zu-1 Videotelefonien</p>
					</div>
				</div>
				<div class="text-sm text-gray-500">v{appVersion}</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-4xl font-bold text-white">Verbinden Sie sich jetzt</h2>
			<p class="mx-auto max-w-2xl text-lg text-gray-300">
				Starten Sie sofort eine sichere, verschlüsselte 1-zu-1 Videokonferenz. Keine Downloads, keine
				Anmeldung erforderlich – nutzen Sie die App direkt im Browser.
			</p>
		</div>

		<!-- Card -->
		<div
			class="mx-auto max-w-md rounded-xl border border-gray-700 bg-gray-800 bg-opacity-50 p-8 shadow-xl backdrop-blur"
		>
			<JoinRoom />
		</div>

		<!-- Info Section -->
		<div class="mt-16 grid gap-8 sm:grid-cols-3">
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-blue-600 bg-opacity-20 p-4 text-4xl">🔒</div>
				<h3 class="mb-2 font-semibold text-white">Verschlüsselt</h3>
				<p class="text-sm text-gray-400">
					End-to-End-Verschlüsselung durch WebRTC mit STUN/TURN-Unterstützung
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-green-600 bg-opacity-20 p-4 text-4xl">⚡</div>
				<h3 class="mb-2 font-semibold text-white">Schnell</h3>
				<p class="text-sm text-gray-400">
					Direktverbindung zwischen zwei Browsern für minimale Latenz
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-purple-600 bg-opacity-20 p-4 text-4xl">📱</div>
				<h3 class="mb-2 font-semibold text-white">Modern</h3>
				<p class="text-sm text-gray-400">
					Progressive Web App – installierbar auf allen modernen Geräten
				</p>
			</div>
		</div>

		<!-- Features -->
		<div class="mt-16 space-y-4">
			<h3 class="text-xl font-bold text-white">Funktionen</h3>
			<ul class="grid gap-4 sm:grid-cols-2">
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Audio und Video mit hoher Qualität</span>
				</li>
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Bildschirmfreigabe</span>
				</li>
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Geräteauswahl (Kamera, Mikrofon)</span>
				</li>
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Video-Filter</span>
				</li>
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Offline PWA-Funktion</span>
				</li>
				<li class="flex items-center gap-3 text-gray-300">
					<span class="text-lg">✅</span>
					<span>Maximal 2 Teilnehmer pro Raum</span>
				</li>
			</ul>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-700 bg-gray-800 bg-opacity-50 backdrop-blur">
		<div class="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-500">
			<p>
				Eine Progressive Web App für sichere 1-zu-1 Videotelefonie. Gebaut mit SvelteKit, WebRTC und
				Tailwind CSS.
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
