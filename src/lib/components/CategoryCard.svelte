<script lang="ts">
	import type { Category } from '$lib/types';

	let {
		category,
		href,
		label,
		image
	}: {
		category: Category;
		href: string;
		label: string;
		image: string;
	} = $props();

	const descriptions: Record<Category, string> = {
		anime: 'Create your Top 10 Anime list',
		character: 'Create your Top 10 Character list',
		'light-novel': 'Create your Top 10 Light Novel list',
		'visual-novel': 'Create your Top 10 Visual Novel list'
	};
</script>

<a
	{href}
	data-category={category}
	class="group ticket-cut block bg-[var(--color-fg)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-inset"
>
	<div class="overflow-hidden">
		<img src={image} alt="" class="img-grayscale w-full aspect-[3/4] object-cover" />
	</div>
	<div class="p-4">
		<h2 class="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
			{label}
		</h2>
		<p class="text-editorial-label">{descriptions[category]}</p>
	</div>
</a>