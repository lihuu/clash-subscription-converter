import type { TrojanProxy } from '../types';

export function parseTrojan(link: string): TrojanProxy | null {
    try {
        if (!link.startsWith('trojan://')) {
            return null;
        }

        // Format: trojan://password@server:port?params#name
        const url = new URL(link);
        const password = decodeURIComponent(url.username);
        const server = url.hostname;
        const port = parseInt(url.port, 10);
        const name = decodeURIComponent(url.hash.slice(1)) || `${server}:${port}`;
        const params = url.searchParams;

        const proxy: TrojanProxy = {
            name,
            type: 'trojan',
            server,
            port,
            password,
        };

        // SNI
        const sni = params.get('sni');
        if (sni) {
            proxy.sni = sni;
        }

        // Allow insecure
        const allowInsecure = params.get('allowInsecure');
        if (allowInsecure === '1' || allowInsecure === 'true') {
            proxy['skip-cert-verify'] = true;
        }

        // ALPN
        const alpn = params.get('alpn');
        if (alpn) {
            proxy.alpn = alpn.split(',');
        }

        // Transport type
        const type = params.get('type');
        if (type === 'ws') {
            proxy.network = 'ws';
            proxy['ws-opts'] = {};
            const path = params.get('path');
            if (path) {
                proxy['ws-opts'].path = decodeURIComponent(path);
            }
            const host = params.get('host');
            if (host) {
                proxy['ws-opts'].headers = { Host: host };
            }
        } else if (type === 'grpc') {
            proxy.network = 'grpc';
            proxy['grpc-opts'] = {};
            const serviceName = params.get('serviceName');
            if (serviceName) {
                proxy['grpc-opts']['grpc-service-name'] = serviceName;
            }
        }

        return proxy;
    } catch {
        return null;
    }
}
