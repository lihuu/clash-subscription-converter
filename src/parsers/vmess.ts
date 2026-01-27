import type { VmessProxy } from '../types';

interface VmessConfig {
    v?: string;
    ps?: string;
    add: string;
    port: number | string;
    id: string;
    aid?: number | string;
    net?: string;
    type?: string;
    host?: string;
    path?: string;
    tls?: string;
    sni?: string;
    scy?: string;
}

export function parseVmess(link: string): VmessProxy | null {
    try {
        if (!link.startsWith('vmess://')) {
            return null;
        }

        const base64Content = link.slice(8);
        const jsonStr = atob(base64Content);
        const config: VmessConfig = JSON.parse(jsonStr);

        const proxy: VmessProxy = {
            name: config.ps || `${config.add}:${config.port}`,
            type: 'vmess',
            server: config.add,
            port: typeof config.port === 'string' ? parseInt(config.port, 10) : config.port,
            uuid: config.id,
            alterId: typeof config.aid === 'string' ? parseInt(config.aid, 10) : (config.aid || 0),
            cipher: config.scy || 'auto',
        };

        // TLS settings
        if (config.tls === 'tls') {
            proxy.tls = true;
            if (config.sni) {
                proxy.servername = config.sni;
            }
        }

        // Network/Transport settings
        const network = config.net || 'tcp';
        if (network !== 'tcp') {
            proxy.network = network as VmessProxy['network'];
        }

        // WebSocket options
        if (network === 'ws') {
            proxy['ws-opts'] = {};
            if (config.path) {
                proxy['ws-opts'].path = config.path;
            }
            if (config.host) {
                proxy['ws-opts'].headers = { Host: config.host };
            }
        }

        // gRPC options
        if (network === 'grpc') {
            proxy['grpc-opts'] = {};
            if (config.path) {
                proxy['grpc-opts']['grpc-service-name'] = config.path;
            }
        }

        // H2 options
        if (network === 'h2') {
            proxy['h2-opts'] = {};
            if (config.path) {
                proxy['h2-opts'].path = config.path;
            }
            if (config.host) {
                proxy['h2-opts'].host = [config.host];
            }
        }

        return proxy;
    } catch {
        return null;
    }
}
