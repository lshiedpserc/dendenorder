<script lang="ts">
    import { page } from '$app/state';
    let { children, data } = $props<{ children: any, data: any }>();
    let adminPath = $derived(page.params.admin);
</script>

{#if page.url.pathname.endsWith('/login')}
    {@render children()}
{:else}
    <!-- TopAppBar -->
    <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-glass-bg backdrop-blur-[20px] dark:bg-glass-bg border-b border-glass-border shadow-sm">
        <div class="flex items-center gap-stack-sm">
            <button class="w-10 h-10 rounded-full bg-surface-container overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary hover:bg-surface-variant/50 transition-colors flex items-center justify-center text-primary">
               <span class="material-symbols-outlined">restaurant</span>
            </button>
            <h1 class="font-display-lg text-display-lg text-primary dark:text-primary-fixed-dim">Denden Order</h1>
        </div>
        <div class="flex items-center gap-stack-md">
            <!-- Real-time indicator -->
            <div class="flex items-center gap-2 bg-inverse-surface/5 px-3 py-1 rounded-full border border-glass-border">
                <div class="w-2 h-2 rounded-full bg-success-green pulse-dot"></div>
                <span class="font-label-caps text-label-caps text-success-green uppercase tracking-wider">ライブ</span>
            </div>
            <button class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">notifications</span>
            </button>
        </div>
    </header>

    <!-- NavigationDrawer (Hidden on Mobile, Visible on md+) -->
    <nav class="hidden md:flex fixed inset-y-0 left-0 z-[60] w-72 flex-col p-stack-lg bg-surface-bright/90 backdrop-blur-[40px] dark:bg-surface-dim/90 border-r border-glass-border shadow-xl h-full mt-16 pt-8">
        <div class="mb-stack-lg flex items-center gap-stack-md p-stack-md glass-card rounded-xl">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[28px]">store</span>
            </div>
            <div>
                <h2 class="font-headline-md text-headline-md text-primary">店舗 #402</h2>
                <p class="font-body-md text-body-md text-on-surface-variant">Denden Order Staff</p>
                <div class="mt-1 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-success-green"></span>
                    <span class="font-label-caps text-label-caps text-on-surface-variant">オンライン</span>
                </div>
            </div>
        </div>

        <ul class="flex flex-col gap-stack-sm mt-stack-md">
            <li>
                <a href={`/${adminPath}/dashboard`} class="flex items-center gap-stack-md p-stack-md transition-all rounded-xl {page.url.pathname.includes('/dashboard') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest/30'}">
                    <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/dashboard') ? "'FILL' 1" : "'FILL' 0"}">oven_gen</span>
                    <span class="font-headline-sm text-headline-sm">キッチンディスプレイ</span>
                </a>
            </li>
            <li>
                <a href={`/${adminPath}/menu`} class="flex items-center gap-stack-md rounded-xl p-stack-md transition-all {page.url.pathname.includes('/menu') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest/30'}">
                    <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/menu') ? "'FILL' 1" : "'FILL' 0"}">edit_note</span>
                    <span class="font-headline-sm text-headline-sm">メニュー編集</span>
                </a>
            </li>
            <li>
                <a href={`/${adminPath}/settings`} class="flex items-center gap-stack-md p-stack-md transition-all rounded-xl {page.url.pathname.includes('/settings') ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest/30'}">
                    <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/settings') ? "'FILL' 1" : "'FILL' 0"}">settings</span>
                    <span class="font-headline-sm text-headline-sm">設定</span>
                </a>
            </li>
        </ul>
    </nav>

    <!-- Main Content Area -->
    <main class="pt-24 px-margin-mobile md:ml-72 max-w-5xl mx-auto pb-safe min-h-screen relative">
        {@render children()}
    </main>

    <!-- BottomNavBar (Mobile Only) -->
    <nav class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-safe h-20 bg-glass-bg backdrop-blur-[50px] dark:bg-glass-bg border-t border-glass-border shadow-lg pb-4">
        <a href={`/${adminPath}/dashboard`} class="flex flex-col items-center justify-center px-stack-md py-unit transition-all rounded-2xl {page.url.pathname.includes('/dashboard') ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low/50'}">
            <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/dashboard') ? "'FILL' 1" : "'FILL' 0"}">oven_gen</span>
            <span class="font-label-caps text-label-caps mt-1">注文</span>
        </a>
        <a href={`/${adminPath}/menu`} class="flex flex-col items-center justify-center px-stack-md py-unit transition-all rounded-2xl {page.url.pathname.includes('/menu') ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low/50'}">
            <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/menu') ? "'FILL' 1" : "'FILL' 0"}">edit_note</span>
            <span class="font-label-caps text-label-caps mt-1">メニュー</span>
        </a>
        <a href={`/${adminPath}/settings`} class="flex flex-col items-center justify-center px-stack-md py-unit transition-all rounded-2xl {page.url.pathname.includes('/settings') ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low/50'}">
            <span class="material-symbols-outlined" style="font-variation-settings: {page.url.pathname.includes('/settings') ? "'FILL' 1" : "'FILL' 0"}">settings</span>
            <span class="font-label-caps text-label-caps mt-1">設定</span>
        </a>
    </nav>
{/if}
