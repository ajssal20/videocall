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

<div class="space-y-6">
	<!-- Fehleranzeiige -->
	{#if error}
		<div class="rounded-lg bg-red-900 p-4 text-red-100">{error}</div>
	{/if}

	<!-- Neuen Raum erstellen -->
	<div class="flex flex-col gap-4">
		<h2 class="text-xl font-semibold text-gray-100">Neuen Raum erstellen</h2>
		<p class="text-sm text-gray-400">
			Ein eindeutiger 6-stelliger Code wird automatisch generiert, den Sie weitergeben können.
		</p>
		<button
			onclick={createRoom}
			disabled={isCreating}
			class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
		>
			{isCreating ? 'Wird erstellt...' : '✨ Raum erstellen'}
		</button>
	</div>

	<!-- Divider -->
	<div class="flex items-center gap-3">
		<div class="flex-1 border-t border-gray-600"></div>
		<span class="text-sm text-gray-400">ODER</span>
		<div class="flex-1 border-t border-gray-600"></div>
	</div>

	<!-- Raum beitreten -->
	<div class="flex flex-col gap-4">
		<h2 class="text-xl font-semibold text-gray-100">Einem Raum beitreten</h2>
		<p class="text-sm text-gray-400">Geben Sie den 6-stelligen Code ein, um einem bestehenden Raum beizutreten.</p>

		<input
			type="text"
			placeholder="z.B. ABC123"
			bind:value={roomCode}
			onkeypress={handleKeyPress}
			maxlength="6"
			class="rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
		/>

		<button
			onclick={joinRoom}
			disabled={isJoining || !roomCode}
			class="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 disabled:opacity-50"
		>
			{isJoining ? 'Wird beigetreten...' : '📞 Raum beitreten'}
		</button>
	</div>
</div>
