<script lang="ts">
    import { page } from '$app/state';
    import { onMount, onDestroy } from 'svelte';
    import { invalidateAll } from '$app/navigation';

    let orderNumber = $derived(page.url.searchParams.get('order'));
    let { data } = $props<{ data: import('./$types').PageData }>();
    let orderStatus = $state(data.initialStatus);
    $effect(() => { orderStatus = data.initialStatus; });

    let eventSource: EventSource | null = null;

    onMount(() => {
        // Poll for initial status in a real app, here we just listen via SSE
        eventSource = new EventSource('/api/sse/customer'); // need a customer generic endpoint

        eventSource.onmessage = (event) => {
            if (event.data === ':') return;
            try {
                const payload = JSON.parse(event.data);
                if (payload.type === 'order_update' && payload.orderNumber === orderNumber) {
                    orderStatus = payload.status;
                }
            } catch (e) {}
        };
    });

    onDestroy(() => {
        if (eventSource) eventSource.close();
    });
</script>

<header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-glass-bg backdrop-blur-[20px] dark:bg-glass-bg border-b border-glass-border shadow-sm">
    <div class="flex items-center gap-stack-sm">
        <h1 class="font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim">デンデンオーダー</h1>
    </div>
</header>

<main class="pt-[120px] px-margin-mobile max-w-lg mx-auto pb-32">
    <section class="glass-card rounded-xl p-stack-lg text-center border relative overflow-hidden transition-all duration-500 {orderStatus === 'cooked' ? 'bg-primary/10 border-primary/30' : 'bg-success-green/10 border-success-green/30'}">
        <!-- Glow effect -->
        <div class="absolute inset-0 blur-3xl rounded-full scale-150 {orderStatus === 'cooked' ? 'bg-primary/5' : 'bg-success-green/5'}"></div>

        <div class="relative z-10">
            {#if orderStatus === 'cooked'}
                <span class="material-symbols-outlined text-[64px] text-primary mb-4 filled">notifications_active</span>
                <h2 class="font-headline-md text-headline-md text-on-surface mb-2">商品が出来上がりました！</h2>
                <p class="font-body-md text-body-md text-on-surface-variant mb-6 font-bold text-primary">レジにてお受け取りとお支払いをお願いします。</p>
            {:else}
                <span class="material-symbols-outlined text-[64px] text-success-green mb-4 filled">check_circle</span>
                <h2 class="font-headline-md text-headline-md text-on-surface mb-2">ご注文ありがとうございます！</h2>
                <p class="font-body-md text-body-md text-on-surface-variant mb-6">店舗にて調理を開始します。レジにて以下の番号をご提示の上、お支払いください。</p>
            {/if}

            <div class="bg-surface-container-lowest rounded-xl py-6 inline-block px-10 shadow-sm border border-glass-border mb-6 w-full max-w-xs mx-auto">
                <span class="font-label-caps text-label-caps text-on-surface-variant block mb-2">受け取り番号</span>
                <span class="font-display-lg text-[40px] leading-none text-primary font-bold tracking-wider">{orderNumber}</span>
            </div>

            <div class="bg-surface-container rounded-lg p-4 flex items-center gap-3 transition-colors {orderStatus === 'cooked' ? 'bg-primary text-white' : ''}">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 {orderStatus === 'cooked' ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}">
                    <span class="material-symbols-outlined filled">{orderStatus === 'cooked' ? 'restaurant' : 'skillet'}</span>
                </div>
                <div class="text-left">
                    <p class="font-bold text-sm {orderStatus === 'cooked' ? 'text-white' : 'text-on-background'}">現在の状況</p>
                    <p class="text-sm {orderStatus === 'cooked' ? 'text-white' : 'text-on-surface-variant'}">
                        {orderStatus === 'cooked' ? '受け取り可能です' : '調理中（お店でお待ちください）'}
                    </p>
                </div>
            </div>
        </div>
    </section>

    <div class="mt-8 text-center">
        <a href="/" class="text-primary hover:underline font-bold text-sm">← トップページに戻る</a>
    </div>
</main>
