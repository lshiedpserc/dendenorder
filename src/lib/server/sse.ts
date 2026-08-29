// Quick in-memory bus for SSE events.
import { EventEmitter } from 'events';

export const sseEmitter = new EventEmitter();
sseEmitter.setMaxListeners(100);

export function emitOrderUpdate(orderId: number, status: string) {
    sseEmitter.emit('order_update', { orderId, status });
}

export function emitNewOrder() {
    sseEmitter.emit('new_order');
}
