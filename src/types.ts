// Protocol type definitions for proxy configurations

export interface ProxyBase {
    name: string;
    server: string;
    port: number;
}

export interface VmessProxy extends ProxyBase {
    type: 'vmess';
    uuid: string;
    alterId: number;
    cipher: string;
    tls?: boolean;
    'skip-cert-verify'?: boolean;
    servername?: string;
    network?: 'ws' | 'grpc' | 'h2' | 'http' | 'tcp';
    'ws-opts'?: {
        path?: string;
        headers?: Record<string, string>;
    };
    'grpc-opts'?: {
        'grpc-service-name'?: string;
    };
    'h2-opts'?: {
        host?: string[];
        path?: string;
    };
    'http-opts'?: {
        method?: string;
        path?: string[];
        headers?: Record<string, string[]>;
    };
}

export interface VlessProxy extends ProxyBase {
    type: 'vless';
    uuid: string;
    flow?: string;
    tls?: boolean;
    'skip-cert-verify'?: boolean;
    servername?: string;
    'client-fingerprint'?: string;
    'reality-opts'?: {
        'public-key': string;
        'short-id'?: string;
    };
    network?: 'ws' | 'grpc' | 'h2' | 'http' | 'tcp';
    'ws-opts'?: {
        path?: string;
        headers?: Record<string, string>;
    };
    'grpc-opts'?: {
        'grpc-service-name'?: string;
    };
}

export interface HysteriaProxy extends ProxyBase {
    type: 'hysteria';
    auth_str?: string;
    alpn?: string[];
    protocol?: string;
    up?: string;
    down?: string;
    'skip-cert-verify'?: boolean;
    sni?: string;
    obfs?: string;
}

export interface Hysteria2Proxy extends ProxyBase {
    type: 'hysteria2';
    password: string;
    'skip-cert-verify'?: boolean;
    sni?: string;
    obfs?: string;
    'obfs-password'?: string;
    fingerprint?: string;
}

export interface ShadowsocksProxy extends ProxyBase {
    type: 'ss';
    cipher: string;
    password: string;
    udp?: boolean;
    plugin?: string;
    'plugin-opts'?: Record<string, unknown>;
}

export interface TrojanProxy extends ProxyBase {
    type: 'trojan';
    password: string;
    sni?: string;
    'skip-cert-verify'?: boolean;
    alpn?: string[];
    network?: 'ws' | 'grpc';
    'ws-opts'?: {
        path?: string;
        headers?: Record<string, string>;
    };
    'grpc-opts'?: {
        'grpc-service-name'?: string;
    };
}

export type Proxy =
    | VmessProxy
    | VlessProxy
    | HysteriaProxy
    | Hysteria2Proxy
    | ShadowsocksProxy
    | TrojanProxy;
