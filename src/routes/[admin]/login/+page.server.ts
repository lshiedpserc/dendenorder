import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { storeSettings } from '$lib/server/schema';
import type { Actions } from './$types';
import { eq } from 'drizzle-orm';

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const data = await request.formData();
        const pin = data.get('pin');

        if (!pin || typeof pin !== 'string') {
            return fail(400, { error: 'PIN is required' });
        }

        const settings = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).get();

        if (settings && settings.pin === pin) {
            // Success
            cookies.set('admin_auth', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 1 day
            });
            throw redirect(303, `/${params.admin}/dashboard`);
        } else {
            return fail(401, { error: 'Invalid PIN' });
        }
    }
};
