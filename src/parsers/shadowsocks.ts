import type { ShadowsocksProxy } from '../types';

export function parseShadowsocks(link: string): ShadowsocksProxy | null {
    try {
        if (!link.startsWith('ss://')) {
            return null;
        }

        let server = '';
        let port = 0;
        let cipher = '';
        let password = '';
        let name = '';
        let plugin: string | undefined;
        let pluginOpts: Record<string, unknown> | undefined;

        // Remove ss:// prefix
        const content = link.slice(5);

        // Split by # to get name
        const hashIdx = content.indexOf('#');
        const mainPart = hashIdx !== -1 ? content.slice(0, hashIdx) : content;
        name = hashIdx !== -1 ? decodeURIComponent(content.slice(hashIdx + 1)) : '';

        // Try legacy format first: entire mainPart is Base64 encoded
        // Legacy: base64(method:password@server:port)
        let parsed = false;
        try {
            const decoded = atob(mainPart.split('?')[0]);
            // Check if decoded content looks like legacy format (has method:password@server:port)
            if (decoded.includes('@') && decoded.includes(':')) {
                const atIdx = decoded.lastIndexOf('@');
                const userInfo = decoded.slice(0, atIdx);
                const serverPort = decoded.slice(atIdx + 1);

                const colonIdx = userInfo.indexOf(':');
                if (colonIdx !== -1) {
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

                    parsed = true;
                }
            }
        } catch {
            // Not legacy format, try SIP002
        }

        // SIP002 format: base64(method:password)@server:port or method:password@server:port
        if (!parsed && mainPart.includes('@')) {
            const atIdx = mainPart.indexOf('@');
            const userInfoPart = mainPart.slice(0, atIdx);
            const serverPart = mainPart.slice(atIdx + 1);

            // Try to decode userInfo as base64, fallback to plain text
            let userInfo: string;
            try {
                userInfo = atob(userInfoPart);
            } catch {
                userInfo = userInfoPart;
            }

            const colonIdx = userInfo.indexOf(':');
            if (colonIdx === -1) {
                return null;
            }

            cipher = userInfo.slice(0, colonIdx);
            password = userInfo.slice(colonIdx + 1);

            // Parse server:port from serverPart (may include query params)
            const queryIdx = serverPart.indexOf('?');
            const serverPortPart = queryIdx !== -1 ? serverPart.slice(0, queryIdx) : serverPart;

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
            if (queryIdx !== -1) {
                const queryPart = serverPart.slice(queryIdx + 1);
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

            parsed = true;
        }

        if (!parsed) {
            return null;
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

