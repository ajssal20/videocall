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

<div class="min-h-screen bg-gradient-to-br from-rose-900 via-pink-900 to-orange-900 animate-gradient-x">
	<!-- Header -->
	<header class="border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-md shadow-lg animate-fade-in">
		<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="text-4xl animate-bounce">📞</div>
					<div>
						<h1 class="text-2xl font-bold text-white drop-shadow-lg">VideoCall</h1>
						<p class="text-sm text-gray-300">Sichere 1-zu-1 Videotelefonien</p>
					</div>
				</div>
				<div class="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">v{appVersion}</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-12">
		<!-- Hero Section -->
		<div class="mb-16 text-center animate-slide-up">
			<h2 class="mb-6 text-5xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight">
				Verbinden Sie sich jetzt
			</h2>
			<p class="mx-auto max-w-3xl text-xl text-gray-200 leading-relaxed font-light">
				Starten Sie sofort eine sichere, verschlüsselte 1-zu-1 Videokonferenz. Keine Downloads, keine
				Anmeldung erforderlich – nutzen Sie die App direkt im Browser.
			</p>
		</div>

		<!-- Card -->
		<div
			class="mx-auto max-w-lg rounded-3xl border border-gray-600/50 bg-gray-800/95 p-10 shadow-2xl backdrop-blur-lg hover:shadow-pink-500/30 transition-all duration-500 hover:scale-105 animate-fade-in-delayed"
		>
			<JoinRoom />
		</div>

		<!-- Info Section -->
		<div class="mt-20 grid gap-12 sm:grid-cols-3">
			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 bg-opacity-20 p-4 text-4xl shadow-lg">🔒</div>
				<h3 class="mb-2 font-semibold text-white text-lg">Verschlüsselt</h3>
				<p class="text-sm text-gray-300 leading-relaxed">
					End-to-End-Verschlüsselung durch WebRTC mit STUN/TURN-Unterstützung
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-pink-500 bg-opacity-20 p-4 text-4xl shadow-lg">⚡</div>
				<h3 class="mb-2 font-semibold text-white text-lg">Schnell</h3>
				<p class="text-sm text-gray-300 leading-relaxed">
					Direktverbindung zwischen zwei Browsern für minimale Latenz
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-20 p-4 text-4xl shadow-lg">📱</div>
				<h3 class="mb-2 font-semibold text-white text-lg">Modern</h3>
				<p class="text-sm text-gray-300 leading-relaxed">
					Progressive Web App – installierbar auf allen modernen Geräten
				</p>
			</div>
		</div>

		<!-- Features -->
		<div class="mt-20 space-y-6">
			<h3 class="text-2xl font-bold text-white text-center">Funktionen</h3>
			<ul class="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">🎥</span>
					<span class="text-base">Audio und Video mit hoher Qualität</span>
				</li>
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">🖥️</span>
					<span class="text-base">Bildschirmfreigabe</span>
				</li>
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">🎛️</span>
					<span class="text-base">Geräteauswahl (Kamera, Mikrofon)</span>
				</li>
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">🎨</span>
					<span class="text-base">Video-Filter</span>
				</li>
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">📱</span>
					<span class="text-base">Offline PWA-Funktion</span>
				</li>
				<li class="flex items-center gap-4 text-gray-300 bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-colors">
					<span class="text-2xl">👥</span>
					<span class="text-base">Maximal 2 Teilnehmer pro Raum</span>
				</li>
			</ul>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-md mt-20">
		<div class="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-gray-400">
			<p class="text-base">
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
