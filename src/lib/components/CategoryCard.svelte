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

<a {href} data-category={category} class="category-card">
	<h2>{label}</h2>
	<p>{descriptions[category]}</p>
</a>