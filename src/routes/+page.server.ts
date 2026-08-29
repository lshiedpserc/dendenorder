import { db } from '$lib/server/db';
import { menuItems, menuOptions, menuOptionChoices, storeSettings } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const items = await db.select().from(menuItems).where(eq(menuItems.isAvailable, true)).all();
    const store = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).get();

    // Fetch options for items
    const itemsWithOptions = await Promise.all(items.map(async (item) => {
        const opts = await db.select().from(menuOptions).where(eq(menuOptions.menuItemId, item.id)).all();
        const optionsWithChoices = await Promise.all(opts.map(async (opt) => {
            const choices = await db.select().from(menuOptionChoices).where(eq(menuOptionChoices.optionId, opt.id)).all();
            return { ...opt, choices };
        }));
        return { ...item, options: optionsWithChoices };
    }));

    return {
        menuItems: itemsWithOptions,
        store
    };
};
