import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { storeSettings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const settings = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).get();
    return {
        settings
    };
};

export const actions: Actions = {
    updateLeadTime: async ({ request }) => {
        const data = await request.formData();
        const leadTime = parseInt(data.get('leadTime') as string);

        if (isNaN(leadTime) || leadTime < 5) return fail(400, { error: 'Invalid lead time' });

        await db.update(storeSettings)
            .set({ leadTime })
            .where(eq(storeSettings.id, 1));

        return { success: true };
    },
    updateStatus: async ({ request }) => {
        const data = await request.formData();
        const isOpen = data.get('isOpen') === 'on';
        const autoUpdate = data.get('autoUpdate') === 'on';

        await db.update(storeSettings)
            .set({ isOpen, autoUpdate })
            .where(eq(storeSettings.id, 1));

        return { success: true };
    }
};
