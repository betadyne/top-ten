<script lang="ts">
	import { page } from '$app/state';
	import type { TopTenList } from '$lib/types';

	let list = $state<TopTenList | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		const id = page.params.id;
		loading = true;
		error = null;
		fetch(`/api/list/${id}`)
			.then((res) => {
				if (!res.ok) throw new Error('List not found');
				return res.json();
			})
			.then((data) => {
				list = data as TopTenList;
			})
			.catch((err) => {
				error = err instanceof Error ? err.message : 'Failed to load list';
			})
			.finally(() => {
				loading = false;
			});
	});

	function copyLink() {
		navigator.clipboard.writeText(window.location.href);
	}

</script>

{#if loading}
	<p class="text-editorial-label text-center py-24">Loading...</p>
{:else if error}
	<div class="text-center py-24">
		<p class="text-editorial-label mb-4">Error</p>
		<p class="font-body text-sm text-[var(--color-muted)]">{error}</p>
	</div>
{:else if list}
	<article class="max-w-4xl mx-auto px-6 py-16 md:py-24">
		<div class="text-center mb-12 md:mb-16">
			<div class="editorial-brackets mb-8">
				<h1 class="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">{list.title}</h1>
			</div>
			<div class="flex items-center justify-center gap-6 flex-wrap">
				{#if list.creatorName}
					<div class="flex items-baseline gap-2">
						<span class="text-editorial-label">created by</span>
						<span class="font-body text-sm font-semibold">{list.creatorName}</span>
					</div>
				{/if}
				<div class="flex items-baseline gap-2">
					<span class="text-editorial-label">on</span>
					<span class="font-body text-sm font-semibold">{new Date(list.createdAt).toLocaleDateString()}</span>
				</div>
			</div>
			<div class="editorial-divider max-w-xs mx-auto mt-8"></div>
		</div>

		<ol class="space-y-0">
			{#each list.items as item (item.id)}
				<li class="grid grid-cols-[80px_100px_1fr] gap-6 items-center py-6 px-4 border-b border-[var(--color-border)] last:border-b-0">
					<span class="font-display text-3xl md:text-4xl font-bold text-[var(--color-muted)] text-center leading-none">{item.rank}</span>
					<img
						src={item.thumbnailUrl}
						alt={item.title}
						loading="lazy"
						width="100"
						class="w-[100px] h-[140px] object-cover border border-[var(--color-border)]"
						onerror={(e) => { (e.currentTarget as HTMLImageElement).src = item.originalImageUrl; }}
					/>
					<div class="min-w-0">
						<h3 class="font-body text-lg font-medium truncate">{item.title}</h3>
						<p class="text-editorial-label mt-2">Source: {item.source}</p>
					</div>
				</li>
			{/each}
		</ol>

		<div class="text-center mt-12 md:mt-16">
			<button
				type="button"
				onclick={copyLink}
				class="px-6 py-3 text-editorial-label border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
			>
				Copy Link
			</button>
		</div>
	</article>
{/if}
