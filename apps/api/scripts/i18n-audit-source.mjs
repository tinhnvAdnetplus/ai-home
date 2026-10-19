// Static analysis scanner for TS/TSX files
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ALLOW_B, ALLOW_D } from './i18n-audit-rules.mjs';

export const getFiles = (dir, ext) =>
    readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            const skip = [
                'node_modules',
                'dist',
                'build',
                'fixtures',
                'stories',
                'dev',
            ];
            return skip.includes(entry) ? [] : getFiles(full, ext);
        }
        return ext.some((e) => entry.endsWith(e)) && !entry.includes('.test.')
            ? [full]
            : [];
    });

export function checkMissingKeys(jaKeys, srcFiles, jsDir) {
    return srcFiles.flatMap((f) => {
        const content = readFileSync(f, 'utf8');
        const defaultNs =
            content.match(/useTranslation\(\s*['"]([^'"]+)['"]/)?.[1] ??
            'common';
        return [
            ...content.matchAll(/(?:^|[^\w])t\(\s*['"]([^'"]+)['"]/g),
        ].flatMap((m) => {
            const raw = m[1];
            const resolved = raw.includes(':')
                ? raw.replace(':', '.')
                : `${defaultNs}.${raw}`;
            return jaKeys.has(resolved)
                ? []
                : [{ file: f.replace(jsDir + '/', ''), key: raw, resolved }];
        });
    });
}

export function checkHardcodedLiterals(tsxFiles, jsDir) {
    return tsxFiles.flatMap((f) => {
        const rel = f.replace(jsDir + '/', '');
        const content = readFileSync(f, 'utf8');
        const attrs = [
            ...content.matchAll(
                /(placeholder|aria-label|title)=["']([^"']+)["']/g,
            ),
        ]
            .map((m) => ({ file: rel, type: m[1], text: m[2].trim() }))
            .filter(
                (x) =>
                    x.text &&
                    /[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
                        x.text,
                    ) &&
                    !ALLOW_D.has(x.text),
            );
        const text = [
            ...content.matchAll(
                /(?<![A-Za-z0-9_$])<([A-Za-z][A-Za-z0-9_.-]*)(?:\s+[^>]*?)?>([^<>{}]+)(?=(?<![A-Za-z0-9_$])<[/A-Za-z])/g,
            ),
        ]
            .map((m) => ({
                file: rel,
                type: 'jsx_text',
                text: m[2].replace(/\s+/g, ' ').trim(),
            }))
            .filter(
                (x) =>
                    x.text &&
                    !ALLOW_D.has(x.text) &&
                    !/^[\d\s.,:;!?()[\]{}|/\\#*&%@^+=<>-]+$/.test(x.text),
            )
            .filter(
                (x) =>
                    !/(?:;|return|case|default:|const|let|var|function|export|import|=>|===|!==|\?|:|\)|\})/.test(
                        x.text,
                    ),
            )
            .filter((x) =>
                /[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(x.text),
            );
        const hardJp = [
            ...content.matchAll(
                /(['"`])([^'"`\n]*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][^'"`\n]*)\1/g,
            ),
        ]
            .map((m) => ({
                file: rel,
                type: 'hardcoded_jp',
                text: m[2].trim(),
            }))
            .filter(
                (x) => x.text && !ALLOW_B.has(x.text) && !ALLOW_D.has(x.text),
            );
        return [...attrs, ...text, ...hardJp];
    });
}
