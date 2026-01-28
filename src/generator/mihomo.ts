import yaml from 'js-yaml';
import type { Proxy } from '../types';

interface ProxiesConfig {
    proxies: Proxy[];
}

/**
 * Generate a Mihomo proxies YAML from an array of proxies.
 * Only returns the proxies section, not the full config.
 */
export function generateMihomoConfig(proxies: Proxy[]): string {
    const config: ProxiesConfig = {
        proxies: proxies,
    };

    return yaml.dump(config, {
        lineWidth: -1, // Don't wrap lines
        quotingType: '"',
        forceQuotes: false,
        noRefs: true, // Disable anchors/aliases
    });
}

