import { db } from '$lib/server/db';
import { menuItems } from '$lib/server/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const items = await db.select().from(menuItems).all();
    return {
        menuItems: items
    };
};
