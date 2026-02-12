import type { Handle } from '@sveltejs/kit';

const API_BACKEND = process.env.API_BACKEND || 'http://backend:8000';

export const handle: Handle = async ({ event, resolve }) => {
	// Proxy /api/* requests to backend
	if (event.url.pathname.startsWith('/api')) {
		const path = event.url.pathname.replace('/api', '');
		const query = event.url.search;
		const targetUrl = `${API_BACKEND}${path}${query}`;

		const response = await fetch(targetUrl, {
			method: event.request.method,
			headers: event.request.headers,
			body: event.request.method !== 'GET' && event.request.method !== 'HEAD'
				? await event.request.arrayBuffer()
				: undefined,
		});

		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: {
				'content-type': response.headers.get('content-type') || 'application/json',
			},
		});
	}

	return resolve(event);
};
