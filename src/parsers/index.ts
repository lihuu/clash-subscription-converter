import type { Proxy } from '../types';
import { parseVmess } from './vmess';
import { parseVless } from './vless';
import { parseHysteria } from './hysteria';
import { parseHysteria2 } from './hysteria2';
import { parseShadowsocks } from './shadowsocks';
import { parseTrojan } from './trojan';

export { parseVmess } from './vmess';
export { parseVless } from './vless';
export { parseHysteria } from './hysteria';
export { parseHysteria2 } from './hysteria2';
export { parseShadowsocks } from './shadowsocks';
export { parseTrojan } from './trojan';

/**
 * Parse a single proxy link and return the proxy configuration.
 * Returns null if the link cannot be parsed.
 */
export function parseProxyLink(link: string): Proxy | null {
    const trimmedLink = link.trim();

    if (trimmedLink.startsWith('vmess://')) {
        return parseVmess(trimmedLink);
    }

    if (trimmedLink.startsWith('vless://')) {
        return parseVless(trimmedLink);
    }

    if (trimmedLink.startsWith('hysteria://')) {
        return parseHysteria(trimmedLink);
    }

    if (trimmedLink.startsWith('hysteria2://') || trimmedLink.startsWith('hy2://')) {
        return parseHysteria2(trimmedLink);
    }

    if (trimmedLink.startsWith('ss://')) {
        return parseShadowsocks(trimmedLink);
    }

    if (trimmedLink.startsWith('trojan://')) {
        return parseTrojan(trimmedLink);
    }

    return null;
}

/**
 * Parse multiple proxy links from a newline-separated string.
 * Invalid links are skipped.
 */
export function parseProxyLinks(content: string): Proxy[] {
    const lines = content.split(/[\r\n]+/).filter((line) => line.trim());
    const proxies: Proxy[] = [];

    for (const line of lines) {
        const proxy = parseProxyLink(line);
        if (proxy) {
            proxies.push(proxy);
        }
    }

    return proxies;
}
