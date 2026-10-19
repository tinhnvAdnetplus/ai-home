import { z } from 'zod';
import { keySchema } from './primitives.js';
import {
    MAX_CONDITION_DEPTH,
    MAX_CONDITION_NODES,
    MAX_IN_ITEMS,
    type Condition,
    type ScalarLiteral,
    type VarNode,
} from './condition-types.js';
import { calculateMetrics, isRecord } from './condition-metrics.js';

export * from './condition-types.js';

export const scalarLiteralSchema: z.ZodType<ScalarLiteral> = z.union([
    z.string().max(200),
    z.number().finite(),
    z.boolean(),
    z.null(),
]);

export const varNodeSchema: z.ZodType<VarNode> = z
    .object({ var: keySchema })
    .strict();

const inRightSideSchema: z.ZodType<VarNode | ScalarLiteral[]> = z.union([
    varNodeSchema,
    z.array(scalarLiteralSchema).max(MAX_IN_ITEMS),
]);

const nodeLazy = z.lazy(() => conditionSchema);

const andSchema = z.object({ and: z.array(nodeLazy).min(1).max(10) }).strict();
const orSchema = z.object({ or: z.array(nodeLazy).min(1).max(10) }).strict();
const notSchema = z.object({ '!': z.tuple([nodeLazy]) }).strict();
const eqSchema = z.object({ '==': z.tuple([nodeLazy, nodeLazy]) }).strict();
const neqSchema = z.object({ '!=': z.tuple([nodeLazy, nodeLazy]) }).strict();
const ltSchema = z.object({ '<': z.tuple([nodeLazy, nodeLazy]) }).strict();
const lteSchema = z.object({ '<=': z.tuple([nodeLazy, nodeLazy]) }).strict();
const gtSchema = z.object({ '>': z.tuple([nodeLazy, nodeLazy]) }).strict();
const gteSchema = z.object({ '>=': z.tuple([nodeLazy, nodeLazy]) }).strict();
const inSchema = z
    .object({ in: z.tuple([nodeLazy, inRightSideSchema]) })
    .strict();

const rawConditionUnion = z.union([
    scalarLiteralSchema,
    varNodeSchema,
    andSchema,
    orSchema,
    notSchema,
    eqSchema,
    neqSchema,
    ltSchema,
    lteSchema,
    gtSchema,
    gteSchema,
    inSchema,
]);

export const conditionSchema: z.ZodType<Condition> =
    rawConditionUnion.superRefine((val, ctx) => {
        const metrics = calculateMetrics(val);
        if (metrics.depth > MAX_CONDITION_DEPTH) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Condition depth ${metrics.depth.toString()} exceeds maximum ${MAX_CONDITION_DEPTH.toString()}`,
            });
        }
        if (metrics.nodes > MAX_CONDITION_NODES) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Condition node count ${metrics.nodes.toString()} exceeds maximum ${MAX_CONDITION_NODES.toString()}`,
            });
        }
    });

export function parseCondition(input: unknown): Condition {
    return conditionSchema.parse(input);
}

export function collectConditionVars(condition: Condition): string[] {
    const vars = new Set<string>();
    function traverse(node: unknown): void {
        if (node === null || typeof node !== 'object') {
            return;
        }
        if (Array.isArray(node)) {
            for (const item of node) {
                traverse(item);
            }
            return;
        }
        if (isRecord(node)) {
            if (
                'var' in node &&
                typeof node.var === 'string' &&
                Object.keys(node).length === 1
            ) {
                vars.add(node.var);
                return;
            }
            for (const val of Object.values(node)) {
                traverse(val);
            }
        }
    }
    traverse(condition);
    return Array.from(vars).sort();
}
