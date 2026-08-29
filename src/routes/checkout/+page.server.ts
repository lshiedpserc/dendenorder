import { db } from '$lib/server/db';
import { storeSettings, orders, orderItems, orderItemChoices } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const store = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).get();
    return {
        store
    };
};

import { emitNewOrder } from "$lib/server/sse";
export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const cartStr = data.get('cart') as string;
        const pickupTimeStr = data.get('pickupTime') as string;

        if (!cartStr || !pickupTimeStr) return fail(400, { error: 'Invalid data' });

        let cart;
        try {
            cart = JSON.parse(cartStr);
            if (!Array.isArray(cart) || cart.length === 0) throw new Error();
        } catch {
            return fail(400, { error: 'Invalid cart' });
        }

        const store = await db.select().from(storeSettings).where(eq(storeSettings.id, 1)).get();
        if (!store || !store.isOpen) return fail(400, { error: 'Store is closed' });

        // Calculate total
        const totalPrice = cart.reduce((acc, item) => {
            const itemTotal = item.basePrice + item.choices.reduce((sum: number, c: any) => sum + c.extraPrice, 0);
            return acc + (itemTotal * item.quantity);
        }, 0);

        const now = new Date();
        const pickupDate = new Date(parseInt(pickupTimeStr));

        // Ensure pickup time is at least leadTime away
        const minPickupTime = new Date(now.getTime() + store.leadTime * 60000);

        if (pickupDate < new Date(minPickupTime.getTime() - 60000)) { // 1 min leniency
           return fail(400, { error: 'Pickup time too early' });
        }

        // Generate Order Number MMYY-XXX
        const todayStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

        const latestOrder = await db.select({ orderNumber: orders.orderNumber })
                                    .from(orders)
                                    .where(eq(orders.orderNumber, orders.orderNumber))
                                    .all(); // Need to find today's sequence

        const todayOrders = latestOrder.filter(o => o.orderNumber.startsWith(todayStr));
        const seq = (todayOrders.length + 1).toString().padStart(3, '0');
        const orderNumber = `${todayStr}-${seq}`;

        // Insert Order
        const insertedOrder = await db.insert(orders).values({
            orderNumber,
            totalPrice,
            pickupTime: pickupDate,
            status: 'pending'
        }).returning();

        const orderId = insertedOrder[0].id;

        // Insert Items
        for (const item of cart) {
            const insertedItem = await db.insert(orderItems).values({
                orderId,
                menuItemId: item.menuItemId,
                menuItemName: item.name,
                quantity: item.quantity,
                priceAtTime: item.basePrice,
                notes: item.notes || ''
            }).returning();

            const orderItemId = insertedItem[0].id;

            for (const choice of item.choices) {
                await db.insert(orderItemChoices).values({
                    orderItemId,
                    optionName: choice.optionName,
                    choiceName: choice.choiceName,
                    extraPrice: choice.extraPrice
                });
            }
        }

        emitNewOrder();
        throw redirect(303, `/checkout/success?order=${orderNumber}`);
    }
};
