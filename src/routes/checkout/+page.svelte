<script lang="ts">
    import { cart } from '$lib/stores/cart.svelte';
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { data } = $props<{ data: PageData }>();

    onMount(() => {
        if (cart.items.length === 0) {
            goto('/');
        }
    });

    let now = $state(new Date());
    let leadTime = $derived(data.store?.leadTime || 15);

    // Generate next 4 available times (every 10 mins after lead time)
    let availableTimes = $derived.by(() => {
        const times = [];
        const base = new Date(now.getTime() + leadTime * 60000);
        // round up to next 5 min
        const minutes = base.getMinutes();
        const remainder = minutes % 5;
        if (remainder !== 0) {
            base.setMinutes(minutes + (5 - remainder));
        }
        base.setSeconds(0);
        base.setMilliseconds(0);

        for (let i = 0; i < 4; i++) {
            const time = new Date(base.getTime() + i * 10 * 60000);
            times.push(time);
        }
        return times;
    });

    let selectedTimeIdx = $state(0);

    function formatTime(date: Date) {
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    let isSubmitting = $state(false);
</script>

<header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-glass-bg backdrop-blur-[20px] dark:bg-glass-bg border-b border-glass-border shadow-sm">
    <a href="/" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors text-primary">
        <span class="material-symbols-outlined text-[24px]">arrow_back</span>
    </a>
    <h1 class="font-headline-sm text-headline-sm text-primary">お支払い</h1>
    <div class="w-10"></div>
</header>

<main class="pt-24 px-margin-mobile space-y-stack-lg max-w-lg mx-auto pb-40">
    <section class="glass-card rounded-xl p-stack-md relative overflow-hidden group">
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <h2 class="font-headline-sm text-headline-sm text-on-surface mb-stack-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">schedule</span>
            お受け取り時間
        </h2>
        <p class="font-body-md text-body-md text-on-surface-variant mb-stack-md">現在の待ち時間: 約{leadTime}分</p>

        <div class="grid grid-cols-3 gap-gutter-mobile">
            {#each availableTimes as time, i}
                <button
                    onclick={() => selectedTimeIdx = i}
                    class="rounded-lg p-stack-sm flex flex-col items-center justify-center transition-all duration-200 hover:scale-95 {selectedTimeIdx === i ? 'bg-primary-container text-on-primary-container border-primary border' : 'glass-card text-on-surface hover:bg-surface-container-highest'}"
                >
                    {#if i === 0}
                        <span class="font-label-caps text-label-caps opacity-80">最短（今すぐ）</span>
                    {/if}
                    <span class="font-headline-sm text-headline-sm {i !== 0 ? 'mt-4' : ''}">{formatTime(time)}</span>
                </button>
            {/each}
        </div>
    </section>

    <section class="space-y-stack-md">
        <h2 class="font-headline-sm text-headline-sm text-on-surface pl-2">注文内容の確認</h2>
        <div class="glass-card rounded-xl p-stack-md flex flex-col gap-stack-sm">
            {#each cart.items as item}
                <div class="flex items-center justify-between pb-stack-sm border-b border-glass-border">
                    <div class="flex items-center gap-stack-md">
                        <div class="w-8 h-8 bg-surface-container flex items-center justify-center rounded-md font-label-caps text-label-caps text-on-surface">{item.quantity}x</div>
                        <div>
                            <h3 class="font-body-md text-body-md font-semibold text-on-surface">{item.name}</h3>
                            {#if item.choices.length > 0}
                                <p class="font-label-caps text-label-caps text-on-surface-variant">
                                    {item.choices.map(c => c.choiceName).join(', ')}
                                </p>
                            {/if}
                            {#if item.notes}
                                <p class="font-label-caps text-label-caps text-primary italic">
                                    注: {item.notes}
                                </p>
                            {/if}
                        </div>
                    </div>
                    <span class="font-body-lg text-body-lg text-on-surface font-semibold">
                        ¥{((item.basePrice + item.choices.reduce((sum, c) => sum + c.extraPrice, 0)) * item.quantity).toLocaleString()}
                    </span>
                </div>
            {/each}

            <div class="pt-stack-sm space-y-2">
                <div class="flex justify-between font-headline-md text-headline-md text-primary pt-2">
                    <span>合計 (税込)</span>
                    <span>¥{cart.subtotal.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </section>
</main>

<div class="fixed bottom-0 left-0 w-full p-margin-mobile bg-gradient-to-t from-background via-background/90 to-transparent z-40">
    <form method="POST" use:enhance={() => {
        isSubmitting = true;
        return async ({ result }) => {
            isSubmitting = false;
            if (result.type === 'redirect') {
                cart.clear(); // Clear cart on successful submission
                goto(result.location);
            }
        };
    }}>
        <input type="hidden" name="cart" value={JSON.stringify(cart.items)} />
        <input type="hidden" name="pickupTime" value={availableTimes[selectedTimeIdx]?.getTime() || 0} />

        <button
            type="submit"
            disabled={isSubmitting || cart.items.length === 0}
            class="w-full bg-primary hover:bg-primary/90 text-on-primary font-headline-sm text-headline-sm rounded-full py-4 shadow-[0_8px_30px_rgba(174,47,52,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
        >
            {#if isSubmitting}
                <span class="material-symbols-outlined animate-spin text-[24px]">progress_activity</span> 処理中...
            {:else}
                注文を確定する - ¥{cart.subtotal.toLocaleString()}
                <span class="material-symbols-outlined text-[24px]">arrow_forward</span>
            {/if}
        </button>
    </form>
</div>
