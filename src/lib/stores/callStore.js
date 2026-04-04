import { writable } from 'svelte/store';

/**
 * Call State Store
 * Verwaltet den Zustand des laufenden Video-Calls
 */

// Initialer State
const initialState = {
	roomCode: null,
	participantCount: 0,
	connectionState: 'idle', // idle, joining, connected, error, full
	localStream: null,
	remoteStream: null,
	peerConnection: null,
	signalingSocket: null,
	isAudioEnabled: true,
	isVideoEnabled: true,
	isScreenSharing: false,
	currentVideoFilter: 'none',
	remoteVideoFilter: 'none',
	selectedMicrophone: null,
	selectedCamera: null,
	selectedAudioOutput: null,
	error: null
};

// Writable Store
export const callStore = writable(initialState);

// Convenience Actions
export const actions = {
	reset: () => callStore.set(initialState),
	setRoomCode: (code) => callStore.update((s) => ({ ...s, roomCode: code })),
	setParticipantCount: (count) => callStore.update((s) => ({ ...s, participantCount: count })),
	setConnectionState: (state) => callStore.update((s) => ({ ...s, connectionState: state })),
	setLocalStream: (stream) => callStore.update((s) => ({ ...s, localStream: stream })),
	setRemoteStream: (stream) => callStore.update((s) => ({ ...s, remoteStream: stream })),
	setPeerConnection: (pc) => callStore.update((s) => ({ ...s, peerConnection: pc })),
	setSignalingSocket: (socket) => callStore.update((s) => ({ ...s, signalingSocket: socket })),
	toggleAudio: () =>
		callStore.update((s) => {
			if (s.localStream) {
				s.localStream.getAudioTracks().forEach((track) => {
					track.enabled = !s.isAudioEnabled;
				});
			}
			return { ...s, isAudioEnabled: !s.isAudioEnabled };
		}),
	toggleVideo: () =>
		callStore.update((s) => {
			if (s.localStream) {
				s.localStream.getVideoTracks().forEach((track) => {
					track.enabled = !s.isVideoEnabled;
				});
			}
			return { ...s, isVideoEnabled: !s.isVideoEnabled };
		}),
	setScreenSharing: (isSharing) => callStore.update((s) => ({ ...s, isScreenSharing: isSharing })),
	setCurrentVideoFilter: (filter) => callStore.update((s) => ({ ...s, currentVideoFilter: filter })),
	setRemoteVideoFilter: (filter) => callStore.update((s) => ({ ...s, remoteVideoFilter: filter })),
	setSelectedMicrophone: (id) => callStore.update((s) => ({ ...s, selectedMicrophone: id })),
	setSelectedCamera: (id) => callStore.update((s) => ({ ...s, selectedCamera: id })),
	setSelectedAudioOutput: (id) => callStore.update((s) => ({ ...s, selectedAudioOutput: id })),
	setError: (error) => callStore.update((s) => ({ ...s, error }))
};
