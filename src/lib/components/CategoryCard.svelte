<script lang="ts">
	import type { Category } from '$lib/types';

	let {
		category,
		href,
		label
	}: {
		category: Category;
		href: string;
		label: string;
	} = $props();

	const descriptions: Record<Category, string> = {
		anime: 'Create your Top 10 Anime list',
		character: 'Create your Top 10 Character list',
		'light-novel': 'Create your Top 10 Light Novel list',
		'visual-novel': 'Create your Top 10 Visual Novel list'
	};
</script>

<a {href} data-category={category} class="group block py-8 md:py-12 border-b border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]">
	<h2 class="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-3 group-hover:text-[var(--color-accent)] transition-colors">
		{label}
	</h2>
	<p class="text-editorial-label">{descriptions[category]}</p>
</a>