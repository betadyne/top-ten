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

<div class="text-center mb-16 md:mb-24">
	<p class="text-editorial-label mb-4">Create and share your personal rankings</p>
	<div class="editorial-divider max-w-xs mx-auto mb-16"></div>
</div>

<section class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
	{#each categories as { category, label, href }}
		<CategoryCard {category} {label} {href} />
	{/each}
</section>
