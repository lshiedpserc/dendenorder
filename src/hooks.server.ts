import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const adminPath = env.ADMIN_PATH || 'admin';

	// Check if trying to access admin routes
	if (event.url.pathname.startsWith(`/${adminPath}`)) {
        // Protect all sub-routes of admin path
        const isAuthenticated = event.cookies.get('admin_auth') === 'true';

        // If not authenticated and not already on the login page, redirect to login
        if (!isAuthenticated && !event.url.pathname.endsWith('/login')) {
            return new Response('Redirect', {
                status: 303,
                headers: { Location: `/${adminPath}/login` }
            });
        }
	}

	return resolve(event);
};
