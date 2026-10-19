import { type Plan } from '@aihome/planner';
import { roomsOf } from '@aihome/bdm';
import {
    OPTION_RATES,
    INSULATION_RATES,
    SEISMIC_RATES,
    PARKING_RATES,
} from './plan-cost-rates';
import { type PlanCostOption } from './plan-cost-types';

function safeString(v: unknown, fallback: string): string {
    return typeof v === 'string' && v.trim().length > 0 ? v : fallback;
}

function hasOption(arr: unknown, key: string): boolean {
    return Array.isArray(arr) && arr.includes(key);
}

export function calculatePlanOptions(
    plan: Plan,
    answers: Record<string, unknown>,
): readonly PlanCostOption[] {
    const opts: PlanCostOption[] = [];

    for (const opt of OPTION_RATES) {
        if (
            hasOption(answers.equipOpts, opt.key) ||
            hasOption(answers.outdoorOpts, opt.key) ||
            hasOption(answers.storageOpts, opt.key) ||
            hasOption(answers.extraRooms, opt.key)
        ) {
            opts.push({ label: opt.label, cost: opt.cost });
        }
    }

    if (
        roomsOf(plan.model, { type: 'deck' }).length > 0 &&
        !opts.some((o) => o.label.includes('ウッドデッキ'))
    ) {
        opts.push({ label: 'ウッドデッキ・テラス', cost: 42 });
    }
    if (
        roomsOf(plan.model, { type: 'void' }).length > 0 &&
        !opts.some((o) => o.label.includes('吹き抜け'))
    ) {
        opts.push({ label: '吹き抜け（構造・空調対応）', cost: 78 });
    }

    const ins = safeString(answers.insulation, '等級6');
    if (INSULATION_RATES[ins]) {
        opts.push({ label: `断熱 ${ins} 仕様`, cost: INSULATION_RATES[ins] });
    }

    const seis = safeString(answers.seismic, '等級3');
    if (SEISMIC_RATES[seis]) {
        opts.push({ label: `耐震 ${seis} 仕様`, cost: SEISMIC_RATES[seis] });
    }

    const park = safeString(
        answers.parkingType ?? plan.model.parking.kind,
        'カーポート',
    );
    if (PARKING_RATES[park]) {
        opts.push({
            label: park === 'ビルトイン' ? 'ビルトインガレージ' : 'カーポート',
            cost: PARKING_RATES[park],
        });
    }

    return opts;
}
