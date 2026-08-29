import { sseEmitter } from '$lib/server/sse';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { orders } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = ({ request }) => {
    let controller: ReadableStreamDefaultController<any>;

    const stream = new ReadableStream({
        start(c) {
            controller = c;

            const onOrderUpdate = async (data: { orderId: number, status: string }) => {
                try {
                    // Need orderNumber for the customer view, fetch it
                    const order = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, data.orderId)).get();
                    if (order) {
                        controller.enqueue(`data: ${JSON.stringify({ type: 'order_update', orderNumber: order.orderNumber, status: data.status })}\n\n`);
                    }
                } catch(e) {}
            };

            sseEmitter.on('order_update', onOrderUpdate);

            // Keep alive
            const interval = setInterval(() => {
                try {
                    controller.enqueue(`:\n\n`);
                } catch(e) {}
            }, 30000);

            request.signal.addEventListener('abort', () => {
                sseEmitter.off('order_update', onOrderUpdate);
                clearInterval(interval);
                try {
                    controller.close();
                } catch(e) {}
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });
};
