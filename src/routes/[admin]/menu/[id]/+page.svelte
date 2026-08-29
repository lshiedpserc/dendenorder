<script lang="ts">
    import { page } from '$app/state';
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let isNew = $derived(!data.item);

    let options = $state(data.options || []); $effect(() => { options = data.options || []; });

    function addOption() {
        options = [...options, { name: '', isRequired: false, choices: [{ name: '', extraPrice: 0 }] }];
    }

    function removeOption(idx: number) {
        options = options.filter((_, i) => i !== idx);
    }

    function addChoice(optIdx: number) {
        options[optIdx].choices = [...options[optIdx].choices, { name: '', extraPrice: 0 }];
    }

    function removeChoice(optIdx: number, choiceIdx: number) {
        options[optIdx].choices = options[optIdx].choices.filter((_, i) => i !== choiceIdx);
    }

    let optionsDataStr = $derived(JSON.stringify(options));
</script>

<div class="mb-stack-lg">
    <a href="../" class="text-primary hover:underline flex items-center mb-4 text-sm"><span class="material-symbols-outlined text-[18px]">arrow_back</span> 戻る</a>
    <h2 class="font-mobile-hero text-mobile-hero text-on-background">{isNew ? 'メニューの追加' : 'メニューの編集'}</h2>
</div>

<form method="POST" enctype="multipart/form-data" use:enhance class="space-y-6 max-w-2xl">
    <input type="hidden" name="adminPath" value={page.params.admin} />
    <input type="hidden" name="optionsData" value={optionsDataStr} />
    <input type="hidden" name="existingImageUrl" value={data.item?.imageUrl || ''} />

    <div class="glass-card rounded-2xl p-6 space-y-4">
        <div>
            <label class="block text-sm font-medium mb-1">商品名</label>
            <input type="text" name="name" required value={data.item?.name || ''} class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">価格 (¥)</label>
            <input type="number" name="price" required value={data.item?.price || ''} class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">説明</label>
            <textarea name="description" class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">{data.item?.description || ''}</textarea>
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">カテゴリー</label>
            <input type="text" name="category" required value={data.item?.category || 'メイン'} class="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary">
        </div>

        <div>
            <label class="block text-sm font-medium mb-1">画像</label>
            {#if data.item?.imageUrl}
                <img src={data.item.imageUrl} alt="Current" class="w-32 h-32 object-cover rounded-lg mb-2">
            {/if}
            <input type="file" name="image" accept="image/*" class="w-full">
        </div>

        <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isAvailable" checked={data.item?.isAvailable ?? true} class="rounded text-primary focus:ring-primary">
                <span>販売中 (表示)</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isSoldOut" checked={data.item?.isSoldOut ?? false} class="rounded text-primary focus:ring-primary">
                <span>売り切れ</span>
            </label>
        </div>
    </div>

    <!-- Options Section -->
    <div class="glass-card rounded-2xl p-6 space-y-4">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold">オプション (サイズ・トッピング等)</h3>
            <button type="button" onclick={addOption} class="text-primary hover:bg-primary/10 px-3 py-1 rounded-full text-sm font-bold flex items-center">
                <span class="material-symbols-outlined text-[18px]">add</span> オプション追加
            </button>
        </div>

        {#each options as opt, i}
            <div class="border border-surface-variant p-4 rounded-xl space-y-3 bg-white/50">
                <div class="flex justify-between gap-4">
                    <input type="text" bind:value={opt.name} placeholder="オプション名 (例: サイズ)" class="flex-grow rounded border-gray-300 text-sm py-1">
                    <label class="flex items-center gap-2 text-sm">
                        <input type="checkbox" bind:checked={opt.isRequired} class="rounded text-primary">
                        必須
                    </label>
                    <button type="button" onclick={() => removeOption(i)} class="text-error hover:bg-error/10 p-1 rounded"><span class="material-symbols-outlined text-[20px]">delete</span></button>
                </div>

                <div class="pl-4 space-y-2 border-l-2 border-surface-variant">
                    {#each opt.choices as choice, j}
                        <div class="flex gap-2 items-center">
                            <input type="text" bind:value={choice.name} placeholder="選択肢 (例: 大盛り)" class="flex-grow rounded border-gray-300 text-sm py-1">
                            <span class="text-sm">¥</span>
                            <input type="number" bind:value={choice.extraPrice} placeholder="追加料金" class="w-24 rounded border-gray-300 text-sm py-1">
                            <button type="button" onclick={() => removeChoice(i, j)} class="text-error hover:bg-error/10 p-1 rounded"><span class="material-symbols-outlined text-[16px]">close</span></button>
                        </div>
                    {/each}
                    <button type="button" onclick={() => addChoice(i)} class="text-primary text-sm hover:underline flex items-center">
                        <span class="material-symbols-outlined text-[16px]">add</span> 選択肢を追加
                    </button>
                </div>
            </div>
        {/each}
    </div>

    <button type="submit" class="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors">
        保存する
    </button>
</form>
