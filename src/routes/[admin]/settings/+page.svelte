<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();

    let leadTime = $derived(data.settings?.leadTime || 15);
    let isOpen = $derived(data.settings?.isOpen ?? true);
    let autoUpdate = $derived(data.settings?.autoUpdate ?? false);
</script>

<div class="mb-stack-lg">
    <h2 class="font-mobile-hero text-mobile-hero text-on-background">店舗設定</h2>
    <p class="font-body-lg text-body-lg text-on-surface-variant mt-unit">リードタイムとステータスを管理します。</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-gutter-mobile mb-stack-lg">
    <!-- Lead Time Card -->
    <div class="glass-card rounded-[24px] p-stack-md flex flex-col justify-between col-span-1 md:col-span-2">
        <form method="POST" action="?/updateLeadTime" use:enhance>
            <div class="flex justify-between items-start mb-stack-md">
                <div>
                    <h3 class="font-headline-md text-headline-md text-on-background flex items-center gap-unit">
                        <span class="material-symbols-outlined text-primary">schedule</span> 現在の待ち時間（リードタイム）
                    </h3>
                    <p class="font-body-md text-body-md text-on-surface-variant">新規注文の推定待ち時間。</p>
                </div>
                <div class="bg-primary-container text-on-primary-container font-headline-md text-headline-md px-stack-sm py-unit rounded-lg font-bold">
                    {leadTime} 分
                </div>
            </div>

            <div class="px-stack-sm pt-stack-sm flex flex-col gap-4">
                <input
                    name="leadTime"
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={leadTime}
                    onchange={(e) => e.currentTarget.form?.requestSubmit()}
                    class="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                >
                <div class="flex justify-between text-label-caps font-label-caps text-on-surface-variant mt-unit">
                    <span>5 分</span>
                    <span>60 分</span>
                </div>
            </div>
        </form>
    </div>

    <!-- Store Status -->
    <form method="POST" action="?/updateStatus" use:enhance id="statusForm" class="contents">
        <input type="hidden" name="isOpen" value={isOpen ? 'on' : ''} />
        <input type="hidden" name="autoUpdate" value={autoUpdate ? 'on' : ''} />

        <div class="glass-card rounded-[24px] p-stack-md flex justify-between items-center">
            <div>
                <h3 class="font-headline-sm text-headline-sm text-on-background">注文受付中</h3>
                <p class="font-body-md text-body-md text-on-surface-variant text-sm">オンラインでの注文を受け付けています。</p>
            </div>
            <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    id="storeStatusToggle"
                    checked={isOpen}
                    onchange={(e) => e.currentTarget.form?.requestSubmit()}
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10"
                >
                <label for="storeStatusToggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-highest cursor-pointer"></label>
            </div>
        </div>

        <!-- Auto Updates -->
        <div class="glass-card rounded-[24px] p-stack-md flex justify-between items-center">
            <div>
                <h3 class="font-headline-sm text-headline-sm text-on-background">自動ステータス更新</h3>
                <p class="font-body-md text-body-md text-on-surface-variant text-sm">営業時間に基づいて更新します。</p>
            </div>
            <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    id="autoUpdateToggle"
                    checked={autoUpdate}
                    onchange={(e) => e.currentTarget.form?.requestSubmit()}
                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer z-10"
                >
                <label for="autoUpdateToggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-surface-container-highest cursor-pointer"></label>
            </div>
        </div>
    </form>
</div>
