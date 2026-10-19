import {
    mapAnswersToPlanInput,
    VARIANTS,
    defaultPlannerConfig,
    parseAiLayout,
    checkAiLayout,
    buildAiLayoutContext,
    planFromAiLayout,
} from '../src/index.ts';
import { defaultWizard } from '../../../apps/api/resources/js/features/wizard/data/default-wizard.ts';
import { resolveWizardState } from '../../config-schema/src/index.ts';

const BASE = process.env.AI_BASE ?? 'http://nginx';
const raw: Record<string, unknown> = {};
for (const st of defaultWizard.steps)
    for (const sec of st.sections)
        for (const f of sec.fields)
            if (f.defaultValue !== undefined) raw[f.key] = f.defaultValue;

async function ask(
    context: unknown,
    issues?: string[],
    previous?: unknown,
): Promise<{ layout: unknown; ms: number; tokens: number; degraded: boolean }> {
    const t0 = Date.now();
    const res = await fetch(`${BASE}/api/v1/ai/layout`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({ context, issues, previousLayout: previous }),
    });
    const j: any = await res.json();
    if (!res.ok)
        throw new Error(
            `HTTP ${res.status} ${JSON.stringify(j).slice(0, 200)}`,
        );
    return {
        layout: j.layout,
        ms: Date.now() - t0,
        tokens: (j.usage?.inputTokens ?? 0) + (j.usage?.outputTokens ?? 0),
        degraded: j.degraded,
    };
}

type Case = { fr: number; de: number; pt: string; area: number; road?: string };
const cases: Case[] = (
    process.env.AI_CASES
        ? JSON.parse(process.env.AI_CASES)
        : [
              { fr: 12, de: 20, pt: 'two_story', area: 35 },
              { fr: 12, de: 20, pt: 'one_story', area: 30 },
              { fr: 10, de: 22, pt: 'two_story', area: 32 },
              { fr: 9, de: 22, pt: 'one_story', area: 30 },
              { fr: 15, de: 24, pt: 'two_story', area: 40 },
              { fr: 8, de: 22, pt: 'two_story', area: 30 },
          ]
) as Case[];

async function runCase(c: Case, vi: number): Promise<string> {
    const a = {
        ...raw,
        frontage: c.fr,
        depth: c.de,
        land_area: Math.round((c.fr * c.de) / 3.3058),
        plan_type: c.pt,
        floors: c.pt,
        plan_target_area: c.area,
        road_side: c.road ?? 'south',
    };
    const { answers } = resolveWizardState(defaultWizard, a);
    const input = mapAnswersToPlanInput({ ...answers }).input;
    const variant = VARIANTS[vi]!;
    const ctx = buildAiLayoutContext(input, variant);
    let issues: string[] | undefined;
    let prev: unknown;
    let ms = 0,
        tokens = 0;
    let attempts = 0;
    let last = '';
    for (let n = 0; n < 3; n++) {
        attempts++;
        let r;
        try {
            r = await ask(ctx, issues, prev);
        } catch (e) {
            return `${c.road ?? 'south'} ${c.fr}x${c.de} ${c.pt} ${c.area} v${variant.id}: REQUEST FAIL ${(e as Error).message}`;
        }
        ms += r.ms;
        tokens += r.tokens;
        const parsed = parseAiLayout(r.layout);
        if (!parsed.layout) {
            issues = parsed.errors;
            prev = r.layout;
            last = 'schema:' + parsed.errors[0];
            continue;
        }
        const structural = checkAiLayout(parsed.layout, input);
        let problems = structural;
        if (structural.length === 0) {
            const plan = planFromAiLayout(
                input,
                parsed.layout,
                variant,
                defaultPlannerConfig,
                42 + vi,
            );
            const hard = plan.warnings.filter((w) => w.level === 'error');
            problems = hard.map((w) => w.message);
            if (hard.length === 0)
                return `${c.road ?? 'south'} ${c.fr}x${c.de} ${c.pt} ${c.area} v${variant.id}: PASS attempts=${attempts} ${(ms / 1000).toFixed(1)}s tokens=${tokens} area=${plan.summary.tsubo}坪`;
        }
        issues = problems.slice(0, 12);
        prev = parsed.layout;
        last = problems[0] ?? '';
    }
    return `${c.road ?? 'south'} ${c.fr}x${c.de} ${c.pt} ${c.area} v${variant.id}: FAIL attempts=${attempts} ${(ms / 1000).toFixed(1)}s | ${last.slice(0, 120)}`;
}

const variants = (process.env.AI_VARIANTS ?? '0').split(',').map(Number);
const jobs = cases.flatMap((c) => variants.map((v) => ({ c, v })));
let pass = 0;
const out: string[] = [];
const queue = [...jobs];
await Promise.all(
    [0, 1, 2].map(async () => {
        while (queue.length > 0) {
            const j = queue.shift()!;
            const line = await runCase(j.c, j.v);
            out.push(line);
            console.log(line);
            if (line.includes(': PASS')) pass++;
        }
    }),
);
console.log(`SUMMARY pass ${pass}/${jobs.length}`);
