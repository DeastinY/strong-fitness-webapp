import type { Unit } from './types';

const LBS_TO_KG = 0.453592;
const MILES_TO_KM = 1.60934;

export function convertWeight(lbs: number, unit: Unit): number {
	if (unit === 'kg') {
		return Math.round(lbs * LBS_TO_KG * 10) / 10;
	}
	return lbs;
}

export function convertDistance(miles: number, toKm: boolean): number {
	if (toKm) {
		return Math.round(miles * MILES_TO_KM * 100) / 100;
	}
	return miles;
}

export function formatWeight(lbs: number | null, unit: Unit): string {
	if (lbs === null) return '-';
	const value = convertWeight(lbs, unit);
	return `${value} ${unit}`;
}

export function formatVolume(volume: number | null, unit: Unit): string {
	if (volume === null) return '-';
	const value = convertWeight(volume, unit);
	return value.toLocaleString();
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	});
}

export function formatDuration(minutes: number | null): string {
	if (minutes === null) return '-';
	const rounded = Math.round(minutes);
	if (rounded < 60) return `${rounded}m`;
	const hours = Math.floor(rounded / 60);
	const mins = rounded % 60;
	return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getCategoryColor(category: string): string {
	const colors: Record<string, string> = {
		legs: 'rgb(239, 68, 68)',
		back: 'rgb(59, 130, 246)',
		shoulders: 'rgb(34, 197, 94)',
		core: 'rgb(168, 85, 247)',
		cardio: 'rgb(249, 115, 22)',
		other: 'rgb(107, 114, 128)'
	};
	return colors[category] || colors.other;
}

export function getCategoryBgColor(category: string): string {
	const colors: Record<string, string> = {
		legs: 'rgba(239, 68, 68, 0.1)',
		back: 'rgba(59, 130, 246, 0.1)',
		shoulders: 'rgba(34, 197, 94, 0.1)',
		core: 'rgba(168, 85, 247, 0.1)',
		cardio: 'rgba(249, 115, 22, 0.1)',
		other: 'rgba(107, 114, 128, 0.1)'
	};
	return colors[category] || colors.other;
}
