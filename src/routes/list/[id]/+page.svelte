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
	<p>Loading...</p>
{:else if error}
	<p>{error}</p>
{:else if list}
	<article>
		<h1>{list.title}</h1>
		{#if list.creatorName}
			<p>By {list.creatorName}</p>
		{/if}
		<p>{new Date(list.createdAt).toLocaleDateString()}</p>

		<ol>
			{#each list.items as item (item.id)}
				<li>
					<span>{item.rank}</span>
					<img src={item.thumbnailUrl} alt={item.title} loading="lazy" width="150" onerror={(e) => { (e.currentTarget as HTMLImageElement).src = item.originalImageUrl; }} />
					<div>
						<h3>{item.title}</h3>
						{#if item.altTitle}
							<p>{item.altTitle}</p>
						{/if}
						<small>Source: {item.source}</small>
					</div>
				</li>
			{/each}
		</ol>

		<button type="button" onclick={copyLink}>Copy Link</button>
	</article>
{/if}
