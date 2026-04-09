<script>
	import { goto } from '$app/navigation';
	import { actions } from '$lib/stores/callStore.js';

	let roomCode = $state('');
	let isCreating = $state(false);
	let isJoining = $state(false);
	let error = $state('');

	// Generiert einen zufälligen Raum-Code (4 Zeichen)
	function generateRoomCode() {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let code = '';
		for (let i = 0; i < 6; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return code;
	}

	async function createRoom() {
		isCreating = true;
		error = '';

		try {
			const code = generateRoomCode();
			actions.setRoomCode(code);
			await goto(`/room/${code}`);
		} catch (err) {
			error = err.message || 'Fehler beim Erstellen des Raums';
			isCreating = false;
		}
	}

	async function joinRoom() {
		roomCode = roomCode.trim().toUpperCase();

		if (!roomCode) {
			error = 'Bitte geben Sie einen Raumcode ein';
			return;
		}

		if (roomCode.length !== 6) {
			error = 'Der Raumcode sollte 6 Zeichen lang sein';
			return;
		}

		isJoining = true;
		error = '';

		try {
			actions.setRoomCode(roomCode);
			await goto(`/room/${roomCode}`);
		} catch (err) {
			error = err.message || 'Fehler beim Beitreten zum Raum';
			isJoining = false;
		}
	}

	function handleKeyPress(e) {
		if (e.key === 'Enter') {
			joinRoom();
		}
	}
</script>

<div class="space-y-8">
	<!-- Fehleranzeiige -->
	{#if error}
		<div class="rounded-xl bg-red-900/80 p-4 text-red-100 border border-red-700 animate-shake">{error}</div>
	{/if}

	<!-- Neuen Raum erstellen -->
	<div class="flex flex-col gap-6">
		<h2 class="text-2xl font-semibold text-gray-100 text-center">Neuen Raum erstellen</h2>
		<p class="text-base text-gray-400 text-center leading-relaxed">
			Ein eindeutiger 6-stelliger Code wird automatisch generiert, den Sie weitergeben können.
		</p>
		<button
			onclick={createRoom}
			disabled={isCreating}
			class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-orange-400 hover:to-pink-500 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if isCreating}
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
				{:else}
					<span class="animate-pulse">✨</span>
				{/if}
				{isCreating ? 'Wird erstellt...' : 'Raum erstellen'}
			</span>
			<div class="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
		</button>
	</div>

	<!-- Divider -->
	<div class="flex items-center gap-4 py-6">
		<div class="flex-1 border-t border-gray-600"></div>
		<span class="text-base text-gray-400 bg-gray-700/50 px-4 py-2 rounded-full">ODER</span>
		<div class="flex-1 border-t border-gray-600"></div>
	</div>

	<!-- Raum beitreten -->
	<div class="flex flex-col gap-6">
		<h2 class="text-2xl font-semibold text-gray-100 text-center">Einem Raum beitreten</h2>
		<p class="text-base text-gray-400 text-center leading-relaxed">Geben Sie den 6-stelligen Code ein, um einem bestehenden Raum beizutreten.</p>

		<input
			type="text"
			bind:value={roomCode}
			onkeypress={handleKeyPress}
			placeholder="ABC123"
			maxlength="6"
			class="rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-4 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 uppercase text-center text-lg font-mono tracking-wider"
		/>

		<button
			onclick={joinRoom}
			disabled={isJoining || !roomCode.trim()}
			class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-pink-400 hover:to-purple-500 hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
		>
			<span class="relative z-10 flex items-center gap-2">
				{#if isJoining}
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
				{:else}
					<span>🚀</span>
				{/if}
				{isJoining ? 'Trete bei...' : 'Beitreten'}
			</span>
			<div class="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
		</button>
	</div>
</div>

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-5px); }
		75% { transform: translateX(5px); }
	}
	.animate-shake {
		animation: shake 0.5s ease-in-out;
	}
</style>
