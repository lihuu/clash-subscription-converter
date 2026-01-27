import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Mihomo Converter Worker', () => {
	it('serves the Web UI on the root path', async () => {
		const request = new IncomingRequest('http://example.com/');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toContain('text/html');
		const body = await response.text();
		expect(body).toContain('Mihomo 订阅转换器');
	});

	it('returns 400 for missing url parameter in /convert', async () => {
		const request = new IncomingRequest('http://example.com/convert');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(400);
		expect(await response.text()).toBe('Missing url parameter');
	});

	it('supports direct proxy link conversion via POST /convert', async () => {
		// vmess://eyJ2IjoiMiIsInBzIjoidGVzdCIsInFkZCI6IjEuMi4zLjQiLCJwb3J0Ijo0NDMsImlkIjoiMTIzNCIsImFpZCI6MCwibmV0IjoiaGNwIiwidHlwZSI6Im5vbmUiLCJob3N0IjoiIiwicGF0aCI6IiIsInRscyI6IiJ9
		// Base64 of: vmess://... (multiple lines)
		const rawLinks = 'ss://YWVzLTEyOC1nY206cGFzczE@1.1.1.1:8888#test-ss';
		const base64Body = btoa(unescape(encodeURIComponent(rawLinks)));

		const request = new IncomingRequest('http://example.com/convert', {
			method: 'POST',
			body: base64Body,
			headers: { 'Content-Type': 'text/plain' }
		});

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		expect(response.status).toBe(200);
		const yaml = await response.text();
		expect(yaml).toContain('test-ss');
		expect(yaml).toContain('type: ss');
		expect(yaml).toContain('server: 1.1.1.1');
	});
});
