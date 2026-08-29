<script lang="ts">
    import type { PageData } from './$types';
    import { cart } from '$lib/stores/cart.svelte';

    let { data } = $props<{ data: PageData }>();

    let selectedCategory = $state('すべて');

    let categories = $derived([
        'すべて',
        ...new Set(data.menuItems.map(i => i.category))
    ]);

    let filteredItems = $derived(
        selectedCategory === 'すべて'
        ? data.menuItems
        : data.menuItems.filter(i => i.category === selectedCategory)
    );

    // Modal state
    let showModal = $state(false);
    let selectedItem = $state<any>(null);
    let selectedChoices = $state<Record<number, any>>({});
    let itemNotes = $state('');
    let itemQuantity = $state(1);

    function openModal(item: any) {
        if (item.isSoldOut || !data.store?.isOpen) return;
        selectedItem = item;
        selectedChoices = {};
        // Auto-select first choice for required options
        item.options.forEach((opt: any) => {
            if (opt.isRequired && opt.choices.length > 0) {
                selectedChoices[opt.id] = opt.choices[0];
            }
        });
        itemNotes = '';
        itemQuantity = 1;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedItem = null;
    }

    function addToCart() {
        if (!selectedItem) return;

        // Validate required
        for (const opt of selectedItem.options) {
            if (opt.isRequired && !selectedChoices[opt.id]) {
                alert(`${opt.name} を選択してください。`);
                return;
            }
        }

        const choices = Object.values(selectedChoices).filter(Boolean).map(c => ({
            optionName: selectedItem.options.find((o: any) => o.id === c.optionId)?.name || 'Option',
            choiceName: c.name,
            extraPrice: c.extraPrice
        }));

        cart.add({
            menuItemId: selectedItem.id,
            name: selectedItem.name,
            basePrice: selectedItem.price,
            quantity: itemQuantity,
            imageUrl: selectedItem.imageUrl,
            choices,
            notes: itemNotes
        });

        closeModal();
    }

    let currentItemTotal = $derived(() => {
        if (!selectedItem) return 0;
        const extras = Object.values(selectedChoices).reduce((sum, c) => sum + (c?.extraPrice || 0), 0);
        return (selectedItem.price + extras) * itemQuantity;
    });
</script>

<header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-glass-bg backdrop-blur-[20px] dark:bg-glass-bg border-b border-glass-border shadow-sm">
    <div class="flex items-center gap-stack-sm">
        <h1 class="font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim">デンデンオーダー</h1>
    </div>
    {#if !data.store?.isOpen}
        <span class="text-error font-bold text-sm bg-error/10 px-2 py-1 rounded-md">営業時間外</span>
    {/if}
</header>

<main class="pt-[80px] px-margin-mobile max-w-4xl mx-auto pb-32">
    <!-- Category Slider -->
    <div class="sticky top-[72px] z-40 -mx-margin-mobile px-margin-mobile py-2 bg-background/80 backdrop-blur-md mb-stack-lg">
        <div class="flex gap-stack-sm overflow-x-auto hide-scrollbar pb-2">
            {#each categories as category}
                <button
                    onclick={() => selectedCategory = category}
                    class="px-5 py-2 rounded-full font-headline-sm text-headline-sm whitespace-nowrap shadow-sm transition-transform active:scale-95 {selectedCategory === category ? 'bg-primary text-on-primary' : 'glass-card text-on-surface hover:bg-white/90'}"
                >
                    {category}
                </button>
            {/each}
        </div>
    </div>

    <div class="mb-4">
        <h2 class="font-display-lg text-display-lg text-on-background mb-unit">{selectedCategory}のメニュー</h2>
        <p class="font-body-md text-body-md text-on-surface-variant">美味しいメニューをご覧ください。</p>
    </div>

    <!-- Food List -->
    <div class="flex flex-col gap-stack-md">
        {#each filteredItems as item}
            <div
                role="button" tabindex="0" onkeydown={(e) => { if(e.key==="Enter") openModal(item); }} onclick={() => openModal(item)}
                class="glass-card rounded-xl p-3 flex gap-4 items-center transition-colors {item.isSoldOut ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white/80'}"
            >
                <div class="w-24 h-24 shrink-0 rounded-lg overflow-hidden shadow-sm relative">
                    {#if item.imageUrl}
                        <img src={item.imageUrl} alt={item.name} class="w-full h-full object-cover {item.isSoldOut ? 'grayscale' : ''}" />
                    {:else}
                        <div class="w-full h-full bg-surface-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-surface-variant">image</span>
                        </div>
                    {/if}
                    {#if item.isSoldOut}
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span class="text-white font-bold text-sm bg-black/60 px-2 py-1 rounded">完売</span>
                        </div>
                    {/if}
                </div>

                <div class="flex-grow">
                    <h3 class="font-headline-md text-headline-md text-on-background mb-1">{item.name}</h3>
                    <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-2">{item.description}</p>

                    <div class="flex justify-between items-center">
                        <span class="font-headline-sm text-headline-sm text-primary">¥{item.price.toLocaleString()}</span>
                        {#if !item.isSoldOut && data.store?.isOpen}
                            <button class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                <span class="material-symbols-outlined text-sm">add</span>
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</main>

<!-- Floating Action Button (Cart) -->
{#if cart.totalItems > 0}
    <a href="/checkout" class="fixed bottom-8 right-margin-mobile z-40 bg-primary text-white rounded-full p-4 shadow-[0_8px_30px_rgba(174,47,52,0.3)] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform">
        <span class="material-symbols-outlined">shopping_cart</span>
        <span class="font-headline-sm text-headline-sm mr-1">カートを見る</span>
        <div class="bg-white text-primary font-bold text-sm w-6 h-6 rounded-full flex items-center justify-center">{cart.totalItems}</div>
    </a>
{/if}

<!-- Add to Cart Modal -->
{#if showModal && selectedItem}
    <div class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-0 sm:pb-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-on-background/40 backdrop-blur-sm" onclick={closeModal}></div>

        <!-- Modal Content -->
        <div class="glass-card w-full max-w-lg rounded-t-[24px] sm:rounded-[24px] bg-background relative z-10 flex flex-col max-h-[90vh] overflow-hidden transform transition-transform animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">

            <div class="overflow-y-auto p-stack-lg pb-32">
                <div class="flex justify-between items-start mb-4">
                    <h2 class="text-2xl font-bold">{selectedItem.name}</h2>
                    <button onclick={closeModal} class="bg-surface-container-highest rounded-full p-1"><span class="material-symbols-outlined text-[20px]">close</span></button>
                </div>
                <p class="text-on-surface-variant mb-6">{selectedItem.description}</p>

                {#if selectedItem.options.length > 0}
                    <div class="space-y-6">
                        {#each selectedItem.options as opt}
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="font-bold text-lg">{opt.name}</h3>
                                    {#if opt.isRequired}
                                        <span class="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">必須</span>
                                    {/if}
                                </div>

                                <div class="space-y-2">
                                    {#each opt.choices as choice}
                                        <label class="flex justify-between items-center p-3 rounded-xl border border-surface-variant cursor-pointer hover:bg-surface-container-low transition-colors {selectedChoices[opt.id]?.id === choice.id ? 'border-primary bg-primary/5' : ''}">
                                            <div class="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`opt-${opt.id}`}
                                                    checked={selectedChoices[opt.id]?.id === choice.id}
                                                    onclick={() => selectedChoices[opt.id] = choice}
                                                    class="text-primary focus:ring-primary h-5 w-5"
                                                >
                                                <span>{choice.name}</span>
                                            </div>
                                            {#if choice.extraPrice > 0}
                                                <span class="text-primary">+¥{choice.extraPrice.toLocaleString()}</span>
                                            {/if}
                                        </label>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}

                <div class="mt-6">
                    <h3 class="font-bold text-lg mb-2">ご要望（任意）</h3>
                    <textarea bind:value={itemNotes} placeholder="例: わさび抜き" class="w-full rounded-xl border-surface-variant p-3 focus:ring-primary focus:border-primary"></textarea>
                </div>
            </div>

            <!-- Modal Action Bar -->
            <div class="absolute bottom-0 left-0 w-full bg-background border-t border-surface-variant p-4 flex items-center justify-between gap-4 pb-safe">
                <div class="flex items-center bg-surface-container rounded-full overflow-hidden">
                    <button
                        onclick={() => { if(itemQuantity > 1) itemQuantity-- }}
                        class="px-4 py-2 hover:bg-surface-variant active:bg-surface-container-highest transition-colors"
                    >
                        <span class="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <span class="font-bold px-2 w-8 text-center">{itemQuantity}</span>
                    <button
                        onclick={() => itemQuantity++}
                        class="px-4 py-2 hover:bg-surface-variant active:bg-surface-container-highest transition-colors"
                    >
                        <span class="material-symbols-outlined text-[20px]">add</span>
                    </button>
                </div>

                <button onclick={addToCart} class="flex-grow bg-primary text-white font-bold py-3 px-6 rounded-full flex justify-between items-center hover:bg-primary/90 active:scale-95 transition-transform">
                    <span>カートに追加</span>
                    <span>¥{currentItemTotal().toLocaleString()}</span>
                </button>
            </div>
        </div>
    </div>
{/if}
