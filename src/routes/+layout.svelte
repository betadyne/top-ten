<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/favicon.svg";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

{#if page.url.pathname !== "/"}
    <header class="w-full py-8 md:py-12">
        <div class="max-w-5xl mx-auto px-6">
            <h1
                class="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight"
            >
                <a
                    href="/"
                    class="hover:text-[var(--color-accent)] transition-colors"
                    >Top 10 List Maker</a
                >
            </h1>
        </div>
    </header>
{/if}

<main class="w-full max-w-5xl mx-auto px-6 py-6 md:py-8">
    {@render children()}
</main>

<footer class="w-full py-8 md:py-12">
    <div class="max-w-5xl mx-auto px-6 text-center">
        <p class="editorial-brackets text-editorial-label">
            rank.shiroha.my.id
        </p>
    </div>
</footer>
