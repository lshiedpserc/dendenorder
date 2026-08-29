import { sseEmitter } from '$lib/server/sse';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ request }) => {
    let controller: ReadableStreamDefaultController<any>;

    const stream = new ReadableStream({
        start(c) {
            controller = c;

            const onNewOrder = () => {
                try {
                    controller.enqueue(`data: {"type": "new_order"}\n\n`);
                } catch(e) {}
            };

            const onOrderUpdate = (data: any) => {
                try {
                    controller.enqueue(`data: ${JSON.stringify({ type: 'order_update', ...data })}\n\n`);
                } catch(e) {}
            };

            sseEmitter.on('new_order', onNewOrder);
            sseEmitter.on('order_update', onOrderUpdate);

            // Keep alive
            const interval = setInterval(() => {
                try {
                    controller.enqueue(`:\n\n`);
                } catch(e) {}
            }, 30000);

            request.signal.addEventListener('abort', () => {
                sseEmitter.off('new_order', onNewOrder);
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
