import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	const { code } = params;

	// Validiere den Raumcode
	if (!code || code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
		throw redirect(302, '/');
	}

	return {
		roomCode: code
	};
}
