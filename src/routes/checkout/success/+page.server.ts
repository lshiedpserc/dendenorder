import { db } from '$lib/server/db';
import { orders } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const orderNumber = url.searchParams.get('order');
    if (!orderNumber) return { initialStatus: 'pending' };

    const order = await db.select({ status: orders.status }).from(orders).where(eq(orders.orderNumber, orderNumber)).get();

    return {
        initialStatus: order?.status || 'pending'
    };
};
