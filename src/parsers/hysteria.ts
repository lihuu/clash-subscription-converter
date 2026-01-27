import type { HysteriaProxy } from '../types';

export function parseHysteria(link: string): HysteriaProxy | null {
    try {
        if (!link.startsWith('hysteria://')) {
            return null;
        }

        // Format: hysteria://host:port?params#name
        const url = new URL(link);
        const server = url.hostname;
        const port = parseInt(url.port, 10);
        const name = decodeURIComponent(url.hash.slice(1)) || `${server}:${port}`;
        const params = url.searchParams;

        const proxy: HysteriaProxy = {
            name,
            type: 'hysteria',
            server,
            port,
        };

        // Auth
        const auth = params.get('auth');
        if (auth) {
            proxy.auth_str = auth;
        }

        // Protocol
        const protocol = params.get('protocol');
        if (protocol) {
            proxy.protocol = protocol;
        }

        // Bandwidth
        const upmbps = params.get('upmbps');
        const downmbps = params.get('downmbps');
        if (upmbps) {
            proxy.up = `${upmbps} Mbps`;
        }
        if (downmbps) {
            proxy.down = `${downmbps} Mbps`;
        }

        // ALPN
        const alpn = params.get('alpn');
        if (alpn) {
            proxy.alpn = alpn.split(',');
        }

        // SNI/Peer
        const peer = params.get('peer');
        if (peer) {
            proxy.sni = peer;
        }

        // Insecure
        const insecure = params.get('insecure');
        if (insecure === '1' || insecure === 'true') {
            proxy['skip-cert-verify'] = true;
        }

        // Obfs
        const obfs = params.get('obfs');
        if (obfs) {
            proxy.obfs = params.get('obfsParam') || obfs;
        }

        return proxy;
    } catch {
        return null;
    }
}
