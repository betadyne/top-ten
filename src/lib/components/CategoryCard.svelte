<script lang="ts">
    import type { Category } from "$lib/types";

    let {
        category,
        href,
        label,
        image,
        index,
    }: {
        category: Category;
        href: string;
        label: string;
        image: string;
        index: number;
    } = $props();

    const number = $derived(String(index + 1).padStart(2, "0"));

    const descriptions: Record<Category, string> = {
        anime: "Separate peak fiction from seasonal trash",
        character: "Best girl? Best boy? Best... thing?",
        "light-novel": "The real lore is in the LN",
        "visual-novel": "Rate your 50 hours of enter-mashing dedication",
    };
</script>

<a
    {href}
    data-category={category}
    class="group ticket-cut block hover:text-[var(--color-fg)] focus-visible:outline-2 focus-visible:outline-[var(--color-fg)] focus-visible:outline-offset-4"
>
    <div class="flex border border-[var(--color-fg)] bg-[var(--color-bg)]">
        <!-- Left: Text content (~45%) -->
        <div class="flex flex-col justify-between p-4 md:p-5 w-[45%] min-h-0">
            <div>
                <span
                    class="font-display text-3xl md:text-4xl font-bold leading-none text-[var(--color-fg)]"
                >
                    {number}
                </span>
                <h2
                    class="font-display text-lg md:text-xl font-bold uppercase tracking-tight mt-1 text-[var(--color-fg)]"
                >
                    {label}
                </h2>
                <p class="text-editorial-label mt-1">
                    {descriptions[category]}
                </p>
            </div>
            <div class="flex items-center gap-2 mt-3">
                <span class="block flex-1 h-px bg-[var(--color-border)]"></span>
                <span class="font-mono text-xs text-[var(--color-muted)]"
                    >&#x203A;</span
                >
            </div>
        </div>
        <!-- Right: Image (~55%) -->
        <div class="relative w-[55%] corner-brackets">
            <img
                src={image}
                alt=""
                class="img-grayscale w-full h-full object-cover aspect-[4/3]"
            />
        </div>
    </div>
</a>
