import { parseProxyLinks } from './parsers';
import { generateMihomoConfig } from './generator/mihomo';
import { getIndexHtml } from './ui/page';

export default {
	async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const baseUrl = `${url.protocol}//${url.host}`;

		// Serve the web UI
		if (url.pathname === '/' || url.pathname === '') {
			return new Response(getIndexHtml(baseUrl), {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
				},
			});
		}

		// Handle conversion API
		if (url.pathname === '/convert') {
			try {
				let proxyLinks: string;

				if (request.method === 'POST') {
					// Direct links mode: receive Base64 encoded content in body
					const body = await request.text();
					try {
						// Decode Base64 to get the original content
						proxyLinks = decodeURIComponent(escape(atob(body)));
					} catch {
						proxyLinks = body;
					}
				} else {
					// GET mode: subscription URL in query parameter
					const encodedUrl = url.searchParams.get('url');
					if (!encodedUrl) {
						return new Response('Missing url parameter', { status: 400 });
					}

					// Decode: Base64 -> URL decode -> original URL
					let subscriptionUrl: string;
					try {
						subscriptionUrl = decodeURIComponent(atob(encodedUrl));
					} catch {
						// Fallback: try direct URL decode
						subscriptionUrl = decodeURIComponent(encodedUrl);
					}

					// Fetch the subscription content
					const response = await fetch(subscriptionUrl, {
						headers: {
							'User-Agent': 'mihomo-converter/1.0',
						},
					});

					if (!response.ok) {
						return new Response(`Failed to fetch subscription: ${response.statusText}`, {
							status: 502,
						});
					}

					const content = await response.text();

					// Try to decode Base64 (most subscriptions are Base64 encoded)
					try {
						proxyLinks = atob(content.trim());
					} catch {
						proxyLinks = content;
					}
				}

				// Parse proxy links
				const proxies = parseProxyLinks(proxyLinks);

				// Generate Mihomo config
				const yaml = generateMihomoConfig(proxies);

				return new Response(yaml, {
					headers: {
						'Content-Type': 'text/yaml; charset=utf-8',
						'Content-Disposition': 'attachment; filename="mihomo-config.yaml"',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error';
				return new Response(`Conversion error: ${message}`, { status: 500 });
			}
		}

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
