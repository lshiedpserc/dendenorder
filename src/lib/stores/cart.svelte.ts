import { browser } from '$app/environment';

export interface CartChoice {
    optionName: string;
    choiceName: string;
    extraPrice: number;
}

export interface CartItem {
    id: string; // unique local ID (e.g. crypto.randomUUID())
    menuItemId: number;
    name: string;
    basePrice: number;
    quantity: number;
    imageUrl: string | null;
    choices: CartChoice[];
    notes: string;
}

function loadCart(): CartItem[] {
    if (!browser) return [];
    const saved = localStorage.getItem('denden_cart');
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart: CartItem[]) {
    if (!browser) return;
    localStorage.setItem('denden_cart', JSON.stringify(cart));
}

export function createCart() {
    let items = $state<CartItem[]>(loadCart());

    $effect.root(() => {
        $effect(() => {
            saveCart(items);
        });
    });

    return {
        get items() { return items; },

        add(item: Omit<CartItem, 'id'>) {
            items.push({ ...item, id: crypto.randomUUID() });
        },

        remove(id: string) {
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) items.splice(index, 1);
        },

        updateQuantity(id: string, delta: number) {
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                const newQuantity = items[index].quantity + delta;
                if (newQuantity <= 0) {
                    items.splice(index, 1);
                } else {
                    items[index].quantity = newQuantity;
                }
            }
        },

        clear() {
            items = [];
            // Hacky workaround for svelte 5 deep reactivity clear
            if (browser) localStorage.removeItem('denden_cart');
        },

        get totalItems() {
            return items.reduce((acc, item) => acc + item.quantity, 0);
        },

        get subtotal() {
            return items.reduce((acc, item) => {
                const itemTotal = item.basePrice + item.choices.reduce((sum, c) => sum + c.extraPrice, 0);
                return acc + (itemTotal * item.quantity);
            }, 0);
        }
    };
}

// Global singleton instance
export const cart = createCart();
