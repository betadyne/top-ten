<script lang="ts">
	import { CategoryCard } from '$lib/components';
	import type { Category } from '$lib/types';
	import animeHero from '$lib/assets/anime-hero.webp';
	import charHero from '$lib/assets/char-hero.webp';
	import ranobeHero from '$lib/assets/ranobe-hero.webp';
	import vnHero from '$lib/assets/vn-hero.webp';

	const categories: { category: Category; label: string; href: string; image: string }[] = [
		{ category: 'anime', label: 'Anime', href: '/anime', image: animeHero },
		{ category: 'character', label: 'Character', href: '/char', image: charHero },
		{ category: 'light-novel', label: 'Light Novel', href: '/ranobe', image: ranobeHero },
		{ category: 'visual-novel', label: 'Visual Novel', href: '/vn', image: vnHero }
	];
</script>

<div class="mb-6 md:mb-8">
	<h1 class="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none">
		Top 10<br />List Maker
	</h1>
	<p class="text-editorial-label mt-3">Create and share your personal rankings</p>
</div>

<section class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
	{#each categories as { category, label, href, image }, i}
		<CategoryCard {category} {label} {href} {image} index={i} />
	{/each}
</section>