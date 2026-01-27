import type { VlessProxy } from '../types';

export function parseVless(link: string): VlessProxy | null {
    try {
        if (!link.startsWith('vless://')) {
            return null;
        }

        // Format: vless://uuid@server:port?params#name
        const url = new URL(link);
        const uuid = url.username;
        const server = url.hostname;
        const port = parseInt(url.port, 10);
        const name = decodeURIComponent(url.hash.slice(1)) || `${server}:${port}`;
        const params = url.searchParams;

        const proxy: VlessProxy = {
            name,
            type: 'vless',
            server,
            port,
            uuid,
        };

        // Flow (for XTLS)
        const flow = params.get('flow');
        if (flow) {
            proxy.flow = flow;
        }

        // Security
        const security = params.get('security');
        if (security === 'tls') {
            proxy.tls = true;
            const sni = params.get('sni');
            if (sni) {
                proxy.servername = sni;
            }
            proxy['skip-cert-verify'] = params.get('allowInsecure') === '1';
        } else if (security === 'reality') {
            proxy.tls = true;
            const sni = params.get('sni');
            if (sni) {
                proxy.servername = sni;
            }
            const pbk = params.get('pbk');
            if (pbk) {
                proxy['reality-opts'] = {
                    'public-key': pbk,
                };
                const sid = params.get('sid');
                if (sid) {
                    proxy['reality-opts']['short-id'] = sid;
                }
            }
            const fp = params.get('fp');
            if (fp) {
                proxy['client-fingerprint'] = fp;
            }
        }

        // Transport type
        const type = params.get('type') || 'tcp';
        if (type !== 'tcp') {
            proxy.network = type as VlessProxy['network'];
        }

        // WebSocket options
        if (type === 'ws') {
            proxy['ws-opts'] = {};
            const path = params.get('path');
            if (path) {
                proxy['ws-opts'].path = decodeURIComponent(path);
            }
            const host = params.get('host');
            if (host) {
                proxy['ws-opts'].headers = { Host: host };
            }
        }

        // gRPC options
        if (type === 'grpc') {
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
