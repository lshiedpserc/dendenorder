<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form, data } = $props<{ form: ActionData, data: any }>();

    let pinInputs = $state(['', '', '', '']);
    let inputRefs: HTMLInputElement[] = [];

    let combinedPin = $derived(pinInputs.join(''));

    function handleInput(index: number, event: Event) {
        const input = event.target as HTMLInputElement;
        const val = input.value;

        // Take only the last char if they typed multiple somehow
        if (val.length > 0) {
            pinInputs[index] = val.slice(-1);
            if (index < 3) {
                inputRefs[index + 1].focus();
            }
        } else {
            pinInputs[index] = '';
        }
    }

    function handleKeydown(index: number, event: KeyboardEvent) {
        if (event.key === 'Backspace' && pinInputs[index] === '' && index > 0) {
            inputRefs[index - 1].focus();
            pinInputs[index - 1] = '';
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass-card w-full max-w-sm rounded-[24px] p-stack-lg relative">
        <h3 class="font-headline-md text-headline-md text-on-background mb-unit text-center">店舗ログイン</h3>
        <p class="font-body-md text-body-md text-on-surface-variant text-center mb-stack-md">暗証番号を入力してください</p>

        {#if form?.error}
            <p class="text-error text-center mb-4 text-sm font-bold">{form.error}</p>
        {/if}

        <form method="POST" use:enhance>
            <input type="hidden" name="pin" value={combinedPin} />

            <div class="flex justify-center gap-unit mb-stack-lg" dir="ltr">
                {#each [0, 1, 2, 3] as i}
                    <input
                        type="password"
                        inputmode="numeric"
                        maxlength="1"
                        bind:this={inputRefs[i]}
                        bind:value={pinInputs[i]}
                        oninput={(e) => handleInput(i, e)}
                        onkeydown={(e) => handleKeydown(i, e)}
                        class="w-12 h-14 rounded-xl border-none bg-surface-container/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-center font-display-lg text-display-lg text-on-background"
                    />
                {/each}
            </div>

            <button
                type="submit"
                disabled={combinedPin.length < 4}
                class="w-full py-stack-sm rounded-xl font-headline-sm text-headline-sm text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
            >
                ログイン
            </button>
        </form>
    </div>
</div>
