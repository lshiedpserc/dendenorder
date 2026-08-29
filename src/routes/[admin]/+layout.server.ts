import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params }) => {
    // Only allow access if the param matches the admin path
    if (params.admin !== (env.ADMIN_PATH || 'admin')) {
        error(404, 'Not found');
    }

    return {
        adminPath: params.admin
    };
};
