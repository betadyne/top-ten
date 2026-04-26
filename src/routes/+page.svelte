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

<div class="text-center mb-16 md:mb-24">
	<p class="text-editorial-label mb-4">Create and share your personal rankings</p>
	<div class="editorial-divider max-w-xs mx-auto mb-16"></div>
</div>

<section class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
	{#each categories as { category, label, href, image }}
		<CategoryCard {category} {label} {href} {image} />
	{/each}
</section>
