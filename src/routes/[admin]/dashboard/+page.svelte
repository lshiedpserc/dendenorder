<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    import { onMount, onDestroy } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import { page } from '$app/state';

    let { data } = $props<{ data: PageData }>();

    let pendingOrders = $derived(data.pendingOrders);
    let cookedOrders = $derived(data.cookedOrders);

    let activeTab = $state<'pending' | 'cooked'>('pending');

    function formatTime(date: Date) {
        return new Date(date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    function isDelayed(pickupTime: Date) {
        return new Date(pickupTime) < new Date();
    }

    let eventSource: EventSource | null = null;

    onMount(() => {
        eventSource = new EventSource(`/${page.params.admin}/api/sse`);

        eventSource.onmessage = (event) => {
            if (event.data === ':') return; // keep-alive

            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'new_order' || payload.type === 'order_update') {
                    invalidateAll(); // Simplest way to refresh data on event
                }
            } catch (e) {
                // ignore
            }
        };
    });

    onDestroy(() => {
        if (eventSource) eventSource.close();
    });
</script>

<div class="flex gap-stack-sm overflow-x-auto pb-4 mb-4 hide-scrollbar">
    <button
        onclick={() => activeTab = 'pending'}
        class="flex-shrink-0 px-6 py-3 rounded-full font-headline-sm text-headline-sm transition-colors border {activeTab === 'pending' ? 'bg-primary-container text-on-primary-container shadow-lg border-primary/20' : 'glass-card text-on-surface hover:bg-surface-variant/20 border-glass-border'}"
    >
        未調理 <span class="ml-2 bg-on-primary-container text-primary-container px-2 py-0.5 rounded-full text-sm">{pendingOrders.length}</span>
    </button>
    <button
        onclick={() => activeTab = 'cooked'}
        class="flex-shrink-0 px-6 py-3 rounded-full font-headline-sm text-headline-sm transition-colors border {activeTab === 'cooked' ? 'bg-primary-container text-on-primary-container shadow-lg border-primary/20' : 'glass-card text-on-surface hover:bg-surface-variant/20 border-glass-border'}"
    >
        調理済み <span class="ml-2 bg-on-primary-container text-primary-container px-2 py-0.5 rounded-full text-sm">{cookedOrders.length}</span>
    </button>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-gutter-mobile pb-32">
    {#each (activeTab === 'pending' ? pendingOrders : cookedOrders) as order}
        {@const delayed = activeTab === 'pending' && isDelayed(order.pickupTime)}

        <article class="glass-card rounded-[2rem] p-stack-lg border-t-2 {delayed ? 'border-t-error' : 'border-t-transparent'}">
            <div class="flex justify-between items-start mb-stack-md">
                <div>
                    <span class="font-display-lg text-display-lg font-bold {delayed ? 'text-error' : 'text-primary'}">{formatTime(order.pickupTime)}</span>
                    <p class="font-label-caps text-label-caps {delayed ? 'text-error' : 'text-surface-dim'} tracking-wider uppercase mt-1">
                        受取希望時間 {delayed ? '- 遅延' : ''}
                    </p>
                </div>
                <div class="bg-inverse-surface/10 px-3 py-1 rounded-lg border border-glass-border">
                    <span class="font-headline-sm text-headline-sm text-on-surface">#{order.orderNumber}</span>
                </div>
            </div>

            <div class="space-y-3 mb-stack-lg">
                {#each order.items as item}
                    <div class="py-2 border-b border-glass-border">
                        <div class="flex justify-between items-center">
                            <span class="font-headline-md text-headline-md text-on-surface">{item.quantity}x {item.menuItemName}</span>
                        </div>
                        {#if item.choices.length > 0}
                            <div class="flex justify-between items-center py-1 text-surface-variant text-sm">
                                <span class="text-on-surface-variant">{item.choices.map(c => c.choiceName).join(', ')}</span>
                            </div>
                        {/if}
                        {#if item.notes}
                            <div class="flex justify-between items-center py-1 text-primary italic text-sm">
                                <span>注: {item.notes}</span>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

            <form method="POST" action="?/updateStatus" use:enhance>
                <input type="hidden" name="orderId" value={order.id} />
                {#if activeTab === 'pending'}
                    <input type="hidden" name="status" value="cooked" />
                    <button class="w-full py-4 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                        調理完了にする
                    </button>
                {:else}
                    <input type="hidden" name="status" value="served" />
                    <button class="w-full py-4 rounded-xl bg-surface-variant/50 text-on-surface font-headline-sm text-headline-sm border border-glass-border hover:bg-surface-variant/80 active:scale-95 transition-all">
                        提供済みにする
                    </button>
                {/if}
            </form>
        </article>
    {:else}
        <div class="col-span-full py-12 text-center text-on-surface-variant">
            注文はありません
        </div>
    {/each}
</div>
