export const VIDEO_FILTERS = {
	none: { label: 'Normal', css: 'none' },
	grayscale: { label: 'Graustufen', css: 'grayscale(100%)' },
	sepia: { label: 'Sepia', css: 'sepia(100%)' },
	saturate: { label: 'Gesättigt', css: 'saturate(2)' },
	hueRotate: { label: 'Farbton', css: 'hue-rotate(90deg)' },
	contrast: { label: 'Kontrast', css: 'contrast(1.5)' },
	brightness: { label: 'Helligkeit', css: 'brightness(1.2)' },
	blur: { label: 'Unschärfe', css: 'blur(3px)' },
	invert: { label: 'Invertiert', css: 'invert(100%)' }
};

export function applyFilter(videoElement, filterId) {
	if (!videoElement) return;

	const filter = VIDEO_FILTERS[filterId];
	if (!filter) return;

	if (filter.css === 'none') {
		videoElement.style.filter = '';
	} else {
		videoElement.style.filter = filter.css;
	}
}

export function getAvailableFilters() {
	return Object.entries(VIDEO_FILTERS).map(([id, data]) => ({
		id,
		label: data.label
	}));
}


export function clearFilters(videoElement) {
	if (videoElement) {
		videoElement.style.filter = '';
	}
}
