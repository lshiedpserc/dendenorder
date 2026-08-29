import { db } from '$lib/server/db';
import { orders, orderItems, orderItemChoices } from '$lib/server/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { emitOrderUpdate } from '$lib/server/sse';

export const load: PageServerLoad = async () => {
    // Fetch all active orders (pending, cooked)
    const activeOrders = await db.select().from(orders)
        .where(eq(orders.status, 'pending')) // In a real app we'd fetch cooked too based on filters
        .orderBy(asc(orders.pickupTime))
        .all();

    // Fetch cooked orders
    const cookedOrders = await db.select().from(orders)
        .where(eq(orders.status, 'cooked'))
        .orderBy(asc(orders.pickupTime))
        .all();

    const fetchOrderDetails = async (orderList: any[]) => {
        return Promise.all(orderList.map(async (order) => {
            const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).all();
            const itemsWithChoices = await Promise.all(items.map(async (item) => {
                const choices = await db.select().from(orderItemChoices).where(eq(orderItemChoices.orderItemId, item.id)).all();
                return { ...item, choices };
            }));
            return { ...order, items: itemsWithChoices };
        }));
    };

    return {
        pendingOrders: await fetchOrderDetails(activeOrders),
        cookedOrders: await fetchOrderDetails(cookedOrders)
    };
};

export const actions: Actions = {
    updateStatus: async ({ request }) => {
        const data = await request.formData();
        const orderId = parseInt(data.get('orderId') as string);
        const status = data.get('status') as string;

        await db.update(orders).set({ status }).where(eq(orders.id, orderId));
        emitOrderUpdate(orderId, status);

        return { success: true };
    }
};
