import { type Condition } from './condition-types.js';
import { conditionSchema } from './condition.js';
import { type EvaluateSafeResult } from './answer-types.js';
import { isRecord, isTruthy, readVar } from './answer-normalize.js';
import { evaluateBinaryOp, evalIn } from './condition-operators.js';

type EvalState = {
    nodeCount: number;
    hasExceededLimits: boolean;
};

function evalBinary(
    node: Record<string, unknown>,
    op: string,
    answers: Readonly<Record<string, unknown>>,
    depth: number,
    state: EvalState,
): unknown {
    const list = node[op];
    if (!Array.isArray(list) || list.length !== 2) {
        return false;
    }
    const left = evalNode(list[0], answers, depth + 1, state);
    const right = evalNode(list[1], answers, depth + 1, state);
    return evaluateBinaryOp(left, right, op);
}

function evalNode(
    node: unknown,
    answers: Readonly<Record<string, unknown>>,
    depth: number,
    state: EvalState,
): unknown {
    if (state.hasExceededLimits || depth > 8) {
        state.hasExceededLimits = true;
        return false;
    }
    state.nodeCount += 1;
    if (state.nodeCount > 80) {
        state.hasExceededLimits = true;
        return false;
    }
    if (
        node === null ||
        typeof node === 'string' ||
        typeof node === 'number' ||
        typeof node === 'boolean'
    ) {
        return node;
    }
    if (!isRecord(node)) {
        return false;
    }
    if ('var' in node && typeof node.var === 'string') {
        return readVar(answers, node.var);
    }
    if ('and' in node && Array.isArray(node.and)) {
        state.nodeCount += node.and.length;
        if (state.nodeCount > 80) {
            state.hasExceededLimits = true;
            return false;
        }
        for (const child of node.and) {
            if (!isTruthy(evalNode(child, answers, depth + 1, state))) {
                return false;
            }
        }
        return true;
    }
    if ('or' in node && Array.isArray(node.or)) {
        state.nodeCount += node.or.length;
        if (state.nodeCount > 80) {
            state.hasExceededLimits = true;
            return false;
        }
        for (const child of node.or) {
            if (isTruthy(evalNode(child, answers, depth + 1, state))) {
                return true;
            }
        }
        return false;
    }
    if ('!' in node && Array.isArray(node['!']) && node['!'].length > 0) {
        return !isTruthy(evalNode(node['!'][0], answers, depth + 1, state));
    }
    for (const op of ['==', '!=', '<', '<=', '>', '>=']) {
        if (op in node) {
            return evalBinary(node, op, answers, depth, state);
        }
    }
    if ('in' in node && Array.isArray(node.in) && node.in.length === 2) {
        const needle = evalNode(node.in[0], answers, depth + 1, state);
        const haystackNode: unknown = node.in[1];
        state.nodeCount += 1;
        if (Array.isArray(haystackNode)) {
            state.nodeCount += haystackNode.length;
        }
        if (state.nodeCount > 80) {
            state.hasExceededLimits = true;
            return false;
        }
        return evalIn(needle, haystackNode, answers);
    }
    return false;
}

export function evaluateCondition(
    condition: Condition,
    answers: Readonly<Record<string, unknown>>,
): boolean {
    try {
        const state: EvalState = { nodeCount: 0, hasExceededLimits: false };
        const result = evalNode(condition, answers, 1, state);
        if (state.hasExceededLimits) {
            return false;
        }
        return isTruthy(result);
    } catch {
        return false;
    }
}

export function evaluateConditionSafe(
    input: unknown,
    answers: unknown,
): EvaluateSafeResult {
    const parseResult = conditionSchema.safeParse(input);
    if (!parseResult.success) {
        return { ok: false, reason: 'INVALID_CONDITION' };
    }
    if (!isRecord(answers)) {
        return { ok: false, reason: 'INVALID_ANSWERS' };
    }
    const isConditionMet = evaluateCondition(parseResult.data, answers);
    return { ok: true, value: isConditionMet };
}
