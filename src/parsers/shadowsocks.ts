import type { ShadowsocksProxy } from '../types';

export function parseShadowsocks(link: string): ShadowsocksProxy | null {
    try {
        if (!link.startsWith('ss://')) {
            return null;
        }

        let server: string;
        let port: number;
        let cipher: string;
        let password: string;
        let name: string;
        let plugin: string | undefined;
        let pluginOpts: Record<string, unknown> | undefined;

        // Remove ss:// prefix
        const content = link.slice(5);

        // Check for SIP002 format with @ symbol
        if (content.includes('@')) {
            // SIP002 format: base64(method:password)@server:port#name?plugin=xxx
            // or: method:password@server:port#name
            const [userInfoPart, serverPart] = content.split('@');

            // Try to decode base64, if fails treat as plain text
            let userInfo: string;
            try {
                userInfo = atob(userInfoPart.split('#')[0].split('?')[0]);
            } catch {
                userInfo = userInfoPart.split('#')[0].split('?')[0];
            }

            const [method, pass] = userInfo.split(':');
            cipher = method;
            password = pass;

            // Parse server:port#name
            const hashIdx = serverPart.indexOf('#');
            const queryIdx = serverPart.indexOf('?');
            let serverPortPart = serverPart;

            if (hashIdx !== -1) {
                name = decodeURIComponent(serverPart.slice(hashIdx + 1).split('?')[0]);
                serverPortPart = serverPart.slice(0, hashIdx);
            } else if (queryIdx !== -1) {
                serverPortPart = serverPart.slice(0, queryIdx);
                name = '';
            } else {
                name = '';
            }

            // Handle IPv6 addresses
            if (serverPortPart.startsWith('[')) {
                const closeBracket = serverPortPart.indexOf(']');
                server = serverPortPart.slice(1, closeBracket);
                port = parseInt(serverPortPart.slice(closeBracket + 2), 10);
            } else {
                const lastColon = serverPortPart.lastIndexOf(':');
                server = serverPortPart.slice(0, lastColon);
                port = parseInt(serverPortPart.slice(lastColon + 1), 10);
            }

            // Parse plugin params from query string
            if (queryIdx !== -1 || serverPart.includes('?')) {
                const queryPart = serverPart.includes('?')
                    ? serverPart.slice(serverPart.indexOf('?') + 1).split('#')[0]
                    : '';
                const params = new URLSearchParams(queryPart);
                const pluginParam = params.get('plugin');
                if (pluginParam) {
                    const [pluginName, ...pluginOptsParts] = pluginParam.split(';');
                    plugin = pluginName;
                    if (pluginOptsParts.length > 0) {
                        pluginOpts = {};
                        for (const opt of pluginOptsParts) {
                            const [key, value] = opt.split('=');
                            if (key && value !== undefined) {
                                pluginOpts[key] = value;
                            }
                        }
                    }
                }
            }
        } else {
            // Legacy format: base64(method:password@server:port)#name
            const hashIdx = content.indexOf('#');
            const base64Part = hashIdx !== -1 ? content.slice(0, hashIdx) : content;
            name = hashIdx !== -1 ? decodeURIComponent(content.slice(hashIdx + 1)) : '';

            const decoded = atob(base64Part);
            const atIdx = decoded.lastIndexOf('@');
            const userInfo = decoded.slice(0, atIdx);
            const serverPort = decoded.slice(atIdx + 1);

            const colonIdx = userInfo.indexOf(':');
            cipher = userInfo.slice(0, colonIdx);
            password = userInfo.slice(colonIdx + 1);

            // Handle IPv6
            if (serverPort.startsWith('[')) {
                const closeBracket = serverPort.indexOf(']');
                server = serverPort.slice(1, closeBracket);
                port = parseInt(serverPort.slice(closeBracket + 2), 10);
            } else {
                const lastColon = serverPort.lastIndexOf(':');
                server = serverPort.slice(0, lastColon);
                port = parseInt(serverPort.slice(lastColon + 1), 10);
            }
        }

        name = name || `${server}:${port}`;

        const proxy: ShadowsocksProxy = {
            name,
            type: 'ss',
            server,
            port,
            cipher,
            password,
            udp: true,
        };

        if (plugin) {
            proxy.plugin = plugin;
            if (pluginOpts) {
                proxy['plugin-opts'] = pluginOpts;
            }
        }

        return proxy;
    } catch {
        return null;
    }
}
