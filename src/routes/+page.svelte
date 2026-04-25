<script lang="ts">
	import { CategoryCard } from '$lib/components';
	import type { Category } from '$lib/types';

	const categories: { category: Category; label: string; href: string }[] = [
		{ category: 'anime', label: 'Anime', href: '/anime' },
		{ category: 'character', label: 'Character', href: '/char' },
		{ category: 'light-novel', label: 'Light Novel', href: '/ranobe' },
		{ category: 'visual-novel', label: 'Visual Novel', href: '/vn' }
	];
</script>

<h1 class="home-title">Top 10 List Maker</h1>
<p class="home-subtitle">Create and share your Top 10 lists for Anime, Characters, Light Novels, and Visual Novels.</p>

<section class="category-grid">
	{#each categories as { category, label, href }}
		<CategoryCard {category} {label} {href} />
	{/each}
</section>