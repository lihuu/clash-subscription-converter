import type { Proxy } from './types';

export interface RenameRule {
    pattern: RegExp;
    replacement: string;
}

/**
 * Parse the rename parameter string into an array of RenameRule objects.
 * Format: pattern1@replacement1+pattern2@replacement2+...
 * The input should already be URL decoded.
 */
export function parseRenameRules(renameParam: string): RenameRule[] {
    if (!renameParam) return [];

    const rules: RenameRule[] = [];
    const parts = renameParam.split('+');

    for (const part of parts) {
        const atIndex = part.indexOf('@');
        if (atIndex === -1) continue;

        const patternStr = part.slice(0, atIndex);
        const replacement = part.slice(atIndex + 1);

        if (!patternStr) continue;

        try {
            const pattern = new RegExp(patternStr);
            rules.push({ pattern, replacement });
        } catch {
            // Invalid regex, skip this rule
            continue;
        }
    }

    return rules;
}

/**
 * Apply rename rules to a list of proxies.
 * If a proxy name matches a rule's pattern, replace the entire name with the replacement.
 * Handles duplicate names by appending numbers.
 */
export function applyRenameRules(proxies: Proxy[], rules: RenameRule[]): Proxy[] {
    if (rules.length === 0) return proxies;

    const usedNames = new Map<string, number>();

    return proxies.map((proxy) => {
        let newName = proxy.name;

        // Find the first matching rule
        for (const rule of rules) {
            if (rule.pattern.test(proxy.name)) {
                newName = rule.replacement;
                break;
            }
        }

        // Handle duplicate names
        const baseName = newName;
        let count = usedNames.get(baseName) || 0;

        if (count > 0) {
            // Name already used, append a number
            newName = `${baseName}${count}`;
        }

        usedNames.set(baseName, count + 1);

        return {
            ...proxy,
            name: newName,
        };
    });
}
