export function weservUrl(url: string, width = 150): string {
	return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp`;
}
