import type { Proxy } from '../types';

/**
 * Convert a proxy object to Mihomo YAML format.
 * Uses simple string formatting to avoid external dependencies.
 */
function proxyToYaml(proxy: Proxy, indent: number = 4): string {
    const spaces = ' '.repeat(indent);
    const lines: string[] = [];

    function addLine(key: string, value: unknown, extraIndent: number = 0) {
        const prefix = spaces + ' '.repeat(extraIndent);
        if (value === undefined || value === null) return;

        if (typeof value === 'object' && !Array.isArray(value)) {
            lines.push(`${prefix}${key}:`);
            for (const [k, v] of Object.entries(value)) {
                addLine(k, v, extraIndent + 2);
            }
        } else if (Array.isArray(value)) {
            lines.push(`${prefix}${key}:`);
            for (const item of value) {
                if (typeof item === 'object') {
                    lines.push(`${prefix}  -`);
                    for (const [k, v] of Object.entries(item)) {
                        addLine(k, v, extraIndent + 4);
                    }
                } else {
                    lines.push(`${prefix}  - ${JSON.stringify(item)}`);
                }
            }
        } else if (typeof value === 'string') {
            // Quote strings that might need escaping
            if (value.includes(':') || value.includes('#') || value.includes('{') ||
                value.includes('}') || value.includes('[') || value.includes(']') ||
                value.includes(',') || value.includes('&') || value.includes('*') ||
                value.includes('?') || value.includes('|') || value.includes('-') ||
                value.includes('<') || value.includes('>') || value.includes('=') ||
                value.includes('!') || value.includes('%') || value.includes('@') ||
                value.includes('`') || value.includes('"') || value.includes("'") ||
                value.includes(' ') || value.includes('\n') || value.trim() !== value ||
                value === '' || value === 'true' || value === 'false' ||
                value === 'null' || /^[0-9.]+$/.test(value)) {
                lines.push(`${prefix}${key}: "${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
            } else {
                lines.push(`${prefix}${key}: ${value}`);
            }
        } else {
            lines.push(`${prefix}${key}: ${value}`);
        }
    }

    lines.push(`${spaces.slice(2)}-`);

    // Output in a sensible order
    addLine('name', proxy.name);
    addLine('type', proxy.type);
    addLine('server', proxy.server);
    addLine('port', proxy.port);

    // Type-specific fields
    if (proxy.type === 'vmess') {
        addLine('uuid', proxy.uuid);
        addLine('alterId', proxy.alterId);
        addLine('cipher', proxy.cipher);
        if (proxy.tls !== undefined) addLine('tls', proxy.tls);
        if (proxy['skip-cert-verify'] !== undefined) addLine('skip-cert-verify', proxy['skip-cert-verify']);
        if (proxy.servername) addLine('servername', proxy.servername);
        if (proxy.network) addLine('network', proxy.network);
        if (proxy['ws-opts']) addLine('ws-opts', proxy['ws-opts']);
        if (proxy['grpc-opts']) addLine('grpc-opts', proxy['grpc-opts']);
        if (proxy['h2-opts']) addLine('h2-opts', proxy['h2-opts']);
        if (proxy['http-opts']) addLine('http-opts', proxy['http-opts']);
    } else if (proxy.type === 'vless') {
        addLine('uuid', proxy.uuid);
        if (proxy.flow) addLine('flow', proxy.flow);
        if (proxy.tls !== undefined) addLine('tls', proxy.tls);
        if (proxy['skip-cert-verify'] !== undefined) addLine('skip-cert-verify', proxy['skip-cert-verify']);
        if (proxy.servername) addLine('servername', proxy.servername);
        if (proxy['client-fingerprint']) addLine('client-fingerprint', proxy['client-fingerprint']);
        if (proxy['reality-opts']) addLine('reality-opts', proxy['reality-opts']);
        if (proxy.network) addLine('network', proxy.network);
        if (proxy['ws-opts']) addLine('ws-opts', proxy['ws-opts']);
        if (proxy['grpc-opts']) addLine('grpc-opts', proxy['grpc-opts']);
    } else if (proxy.type === 'hysteria') {
        if (proxy.auth_str) addLine('auth-str', proxy.auth_str);
        if (proxy.protocol) addLine('protocol', proxy.protocol);
        if (proxy.up) addLine('up', proxy.up);
        if (proxy.down) addLine('down', proxy.down);
        if (proxy['skip-cert-verify'] !== undefined) addLine('skip-cert-verify', proxy['skip-cert-verify']);
        if (proxy.sni) addLine('sni', proxy.sni);
        if (proxy.alpn) addLine('alpn', proxy.alpn);
        if (proxy.obfs) addLine('obfs', proxy.obfs);
    } else if (proxy.type === 'hysteria2') {
        addLine('password', proxy.password);
        if (proxy['skip-cert-verify'] !== undefined) addLine('skip-cert-verify', proxy['skip-cert-verify']);
        if (proxy.sni) addLine('sni', proxy.sni);
        if (proxy.obfs) addLine('obfs', proxy.obfs);
        if (proxy['obfs-password']) addLine('obfs-password', proxy['obfs-password']);
        if (proxy.fingerprint) addLine('fingerprint', proxy.fingerprint);
    } else if (proxy.type === 'ss') {
        addLine('cipher', proxy.cipher);
        addLine('password', proxy.password);
        if (proxy.udp !== undefined) addLine('udp', proxy.udp);
        if (proxy.plugin) addLine('plugin', proxy.plugin);
        if (proxy['plugin-opts']) addLine('plugin-opts', proxy['plugin-opts']);
    } else if (proxy.type === 'trojan') {
        addLine('password', proxy.password);
        if (proxy.sni) addLine('sni', proxy.sni);
        if (proxy['skip-cert-verify'] !== undefined) addLine('skip-cert-verify', proxy['skip-cert-verify']);
        if (proxy.alpn) addLine('alpn', proxy.alpn);
        if (proxy.network) addLine('network', proxy.network);
        if (proxy['ws-opts']) addLine('ws-opts', proxy['ws-opts']);
        if (proxy['grpc-opts']) addLine('grpc-opts', proxy['grpc-opts']);
    }

    return lines.join('\n');
}

/**
 * Generate a complete Mihomo configuration YAML from an array of proxies.
 */
export function generateMihomoConfig(proxies: Proxy[]): string {
    if (proxies.length === 0) {
        return '# No valid proxies found\nproxies: []\n';
    }

    const proxyNames = proxies.map((p) => `"${p.name.replace(/"/g, '\\"')}"`);

    const lines: string[] = [
        '# Mihomo Configuration',
        '# Generated by mihomo-converter',
        '',
        'proxies:',
        ...proxies.map((p) => proxyToYaml(p)),
        '',
        'proxy-groups:',
        '  - name: "Proxy"',
        '    type: select',
        '    proxies:',
        '      - "Auto"',
        '      - "Fallback"',
        ...proxyNames.map((n) => `      - ${n}`),
        '',
        '  - name: "Auto"',
        '    type: url-test',
        '    url: http://www.gstatic.com/generate_204',
        '    interval: 300',
        '    tolerance: 50',
        '    proxies:',
        ...proxyNames.map((n) => `      - ${n}`),
        '',
        '  - name: "Fallback"',
        '    type: fallback',
        '    url: http://www.gstatic.com/generate_204',
        '    interval: 300',
        '    proxies:',
        ...proxyNames.map((n) => `      - ${n}`),
        '',
        'rules:',
        '  - MATCH,Proxy',
        '',
    ];

    return lines.join('\n');
}
