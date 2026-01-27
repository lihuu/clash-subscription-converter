import type { Hysteria2Proxy } from '../types';

export function parseHysteria2(link: string): Hysteria2Proxy | null {
    try {
        if (!link.startsWith('hysteria2://') && !link.startsWith('hy2://')) {
            return null;
        }

        // Normalize to hysteria2://
        const normalizedLink = link.startsWith('hy2://')
            ? 'hysteria2://' + link.slice(6)
            : link;

        // Format: hysteria2://auth@host:port?params#name
        const url = new URL(normalizedLink);
        const password = decodeURIComponent(url.username);
        const server = url.hostname;
        const port = parseInt(url.port, 10);
        const name = decodeURIComponent(url.hash.slice(1)) || `${server}:${port}`;
        const params = url.searchParams;

        const proxy: Hysteria2Proxy = {
            name,
            type: 'hysteria2',
            server,
            port,
            password,
        };

        // SNI
        const sni = params.get('sni');
        if (sni) {
            proxy.sni = sni;
        }

        // Insecure
        const insecure = params.get('insecure');
        if (insecure === '1' || insecure === 'true') {
            proxy['skip-cert-verify'] = true;
        }

        // Obfs
        const obfs = params.get('obfs');
        if (obfs) {
            proxy.obfs = obfs;
            const obfsPassword = params.get('obfs-password');
            if (obfsPassword) {
                proxy['obfs-password'] = obfsPassword;
            }
        }

        // Fingerprint/pinSHA256
        const pinSHA256 = params.get('pinSHA256');
        if (pinSHA256) {
            proxy.fingerprint = pinSHA256;
        }

        return proxy;
    } catch {
        return null;
    }
}
