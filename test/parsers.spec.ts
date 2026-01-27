import { describe, it, expect } from 'vitest';
import { parseProxyLink, parseProxyLinks } from '../src/parsers';

describe('Protocol Parsers', () => {
    it('should parse VMESS links correctly', () => {
        const link = 'vmess://eyJ2IjoiMiIsInBzIjoidGVzdC12bWVzcyIsImFkZCI6IjEuMi4zLjQiLCJwb3J0Ijo0NDMsImlkIjoiMTIzNCIsImFpZCI6MCwibmV0IjoiaDkiLCJ0eXBlIjoibm9uZSIsImhvc3QiOiIiLCJwYXRoIjoiIiwidGxzIjoidGxzIn0=';
        const proxy = parseProxyLink(link);
        expect(proxy).not.toBeNull();
        expect(proxy?.type).toBe('vmess');
        expect(proxy?.name).toBe('test-vmess');
        expect(proxy?.server).toBe('1.2.3.4');
    });

    it('should parse VLESS links correctly', () => {
        const link = 'vless://uuid@1.2.3.4:443?encryption=none&security=tls&type=ws&path=%2Fpath#test-vless';
        const proxy = parseProxyLink(link);
        expect(proxy).not.toBeNull();
        expect(proxy?.type).toBe('vless');
        expect(proxy?.name).toBe('test-vless');
        if (proxy?.type === 'vless') {
            expect(proxy.network).toBe('ws');
        }
    });

    it('should parse Hysteria2 links correctly', () => {
        const link = 'hysteria2://pass@1.2.3.4:443?sni=example.com#test-hy2';
        const proxy = parseProxyLink(link);
        expect(proxy).not.toBeNull();
        expect(proxy?.type).toBe('hysteria2');
        expect(proxy?.name).toBe('test-hy2');
    });

    it('should parse Shadowsocks links correctly (SIP002)', () => {
        const link = 'ss://YWVzLTEyOC1nY206cGFzczE@1.2.3.4:8888#test-ss';
        const proxy = parseProxyLink(link);
        expect(proxy).not.toBeNull();
        expect(proxy?.type).toBe('ss');
        expect(proxy?.name).toBe('test-ss');
        if (proxy?.type === 'ss') {
            expect(proxy.cipher).toBe('aes-128-gcm');
        }
    });

    it('should parse Trojan links correctly', () => {
        const link = 'trojan://pass@1.2.3.4:443?sni=example.com#test-trojan';
        const proxy = parseProxyLink(link);
        expect(proxy).not.toBeNull();
        expect(proxy?.type).toBe('trojan');
        expect(proxy?.name).toBe('test-trojan');
    });

    it('should handle batch parsing and skip invalid links', () => {
        const content = `
      vmess://eyJ2IjoiMiIsInBzIjoidjEiLCJhZGQiOiIxLjEuMS4xIiwicG9ydCI6NDQzLCJpZCI6IjEiLCJhaWQiOjB9
      invalid-link
      ss://YWVzLTEyOC1nY206cGFzcw@2.2.2.2:443#ss1
    `;
        const proxies = parseProxyLinks(content);
        expect(proxies.length).toBe(2);
        expect(proxies[0].name).toBe('v1');
        expect(proxies[1].name).toBe('ss1');
    });
});
