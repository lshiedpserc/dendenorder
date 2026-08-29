<script lang="ts">
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();
</script>

<div class="flex justify-between items-center mb-stack-md">
    <h2 class="font-headline-md text-headline-md text-on-background">メニュー編集</h2>
    <a href="./menu/new" class="text-primary font-headline-sm text-headline-sm flex items-center gap-unit hover:text-primary-container transition-colors">
        <span class="material-symbols-outlined">add</span> 追加
    </a>
</div>

<div class="flex flex-col gap-gutter-mobile mb-stack-lg">
    {#each data.menuItems as item}
        <div class="glass-card rounded-2xl p-stack-sm flex items-center gap-stack-md relative overflow-hidden group" class:opacity-60={!item.isAvailable || item.isSoldOut}>
            <div class="absolute left-0 top-0 bottom-0 w-1 {item.isAvailable && !item.isSoldOut ? 'bg-success-green' : 'bg-surface-variant'}"></div>

            <div class="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                {#if item.imageUrl}
                    <img src={item.imageUrl} alt={item.name} class="w-full h-full object-cover {item.isSoldOut ? 'grayscale-[50%]' : ''}">
                {/if}
            </div>

            <div class="flex-grow">
                <div class="flex justify-between items-start">
                    <h4 class="font-headline-sm text-headline-sm text-on-background">{item.name}</h4>
                    <span class="font-headline-sm text-headline-sm font-bold text-on-background">¥{item.price.toLocaleString()}</span>
                </div>

                <p class="font-body-md text-body-md text-on-surface-variant line-clamp-1">{item.description}</p>

                <div class="flex items-center justify-between mt-unit">
                    {#if !item.isAvailable}
                        <span class="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">非表示</span>
                    {:else if item.isSoldOut}
                        <span class="font-label-caps text-label-caps text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">売り切れ</span>
                    {:else}
                        <span class="font-label-caps text-label-caps text-success-green bg-success-green/10 px-2 py-0.5 rounded-full">販売中</span>
                    {/if}

                    <div class="flex gap-stack-sm">
                        <a href="./menu/{item.id}" class="text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</div>
