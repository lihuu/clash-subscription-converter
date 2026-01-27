import { describe, it, expect } from 'vitest';
import { parseRenameRules, applyRenameRules } from '../src/rename';
import type { ShadowsocksProxy } from '../src/types';

describe('Rename Rules', () => {
    describe('parseRenameRules', () => {
        it('should parse single rule correctly', () => {
            const rules = parseRenameRules('c81s1@美国c81s1');
            expect(rules.length).toBe(1);
            expect(rules[0].replacement).toBe('美国c81s1');
        });

        it('should parse multiple rules separated by +', () => {
            const rules = parseRenameRules('c81s1@美国c81s1+c81s2@美国c81s2+c81s4@日本');
            expect(rules.length).toBe(3);
            expect(rules[0].replacement).toBe('美国c81s1');
            expect(rules[1].replacement).toBe('美国c81s2');
            expect(rules[2].replacement).toBe('日本');
        });

        it('should handle regex patterns', () => {
            const rules = parseRenameRules('.*US.*@美国+.*JP.*@日本');
            expect(rules.length).toBe(2);
            expect(rules[0].pattern.test('Server-US-01')).toBe(true);
            expect(rules[1].pattern.test('Tokyo-JP-02')).toBe(true);
        });

        it('should skip invalid regex patterns', () => {
            const rules = parseRenameRules('[invalid@bad+valid@good');
            expect(rules.length).toBe(1);
            expect(rules[0].replacement).toBe('good');
        });

        it('should return empty array for empty input', () => {
            expect(parseRenameRules('')).toEqual([]);
        });
    });

    describe('applyRenameRules', () => {
        const createProxy = (name: string): ShadowsocksProxy => ({
            name,
            type: 'ss',
            server: '1.1.1.1',
            port: 443,
            cipher: 'aes-128-gcm',
            password: 'pass',
        });

        it('should apply rename rules to matching proxies', () => {
            const proxies = [
                createProxy('c81s1-server'),
                createProxy('c81s2-server'),
                createProxy('other-server'),
            ];
            const rules = parseRenameRules('c81s1@美国+c81s2@日本');
            const result = applyRenameRules(proxies, rules);

            expect(result[0].name).toBe('美国');
            expect(result[1].name).toBe('日本');
            expect(result[2].name).toBe('other-server');
        });

        it('should handle duplicate names by appending numbers', () => {
            const proxies = [
                createProxy('US-01'),
                createProxy('US-02'),
                createProxy('US-03'),
            ];
            const rules = parseRenameRules('US-.*@美国');
            const result = applyRenameRules(proxies, rules);

            expect(result[0].name).toBe('美国');
            expect(result[1].name).toBe('美国1');
            expect(result[2].name).toBe('美国2');
        });

        it('should preserve order of proxies', () => {
            const proxies = [
                createProxy('first'),
                createProxy('second'),
                createProxy('third'),
            ];
            const rules = parseRenameRules('second@renamed');
            const result = applyRenameRules(proxies, rules);

            expect(result[0].name).toBe('first');
            expect(result[1].name).toBe('renamed');
            expect(result[2].name).toBe('third');
        });

        it('should return original proxies when no rules provided', () => {
            const proxies = [createProxy('test')];
            const result = applyRenameRules(proxies, []);
            expect(result).toEqual(proxies);
        });

        it('should use first matching rule only', () => {
            const proxies = [createProxy('US-server')];
            const rules = parseRenameRules('US@第一匹配+server@第二匹配');
            const result = applyRenameRules(proxies, rules);

            expect(result[0].name).toBe('第一匹配');
        });
    });
});
