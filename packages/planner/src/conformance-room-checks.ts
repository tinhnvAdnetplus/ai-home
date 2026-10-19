import { type Plan, type PlanInput } from './types.js';
import { type Room } from '@aihome/bdm';
import {
    type ConformanceCheck,
    findRoomsByType,
    getRoomJo,
} from './conformance-helpers.js';

export function buildRoomChecks(
    input: PlanInput,
    plan: Plan,
    allRooms: readonly Room[],
): ConformanceCheck[] {
    const checks: ConformanceCheck[] = [];

    // Room Counts
    const ldkRooms = findRoomsByType(allRooms, 'ldk');
    checks.push({
        id: 'room_count_ldk',
        label: 'LDKの配置',
        expected: 1,
        actual: ldkRooms.length,
        status: ldkRooms.length >= 1 ? 'pass' : 'fail',
    });
    const masterRooms = findRoomsByType(allRooms, 'bedroom');
    checks.push({
        id: 'room_count_master',
        label: '主寝室の配置',
        expected: 1,
        actual: masterRooms.length,
        status: masterRooms.length >= 1 ? 'pass' : 'fail',
    });
    const kidsRooms = findRoomsByType(allRooms, 'childRoom');
    const expKids = Math.min(4, Math.max(0, input.kidsRooms));
    const isKidsOk =
        kidsRooms.length === expKids ||
        plan.warnings.some((w) => w.code === 'ROOM_SIZE_REDUCED:kids');
    checks.push({
        id: 'room_count_kids',
        label: '子ども部屋数の一致',
        expected: expKids,
        actual: kidsRooms.length,
        status: isKidsOk ? 'pass' : 'fail',
    });
    const tatamiRooms = findRoomsByType(allRooms, 'washitsu');
    const isTatamiExp =
        input.tatamiRoom !== undefined && input.tatamiRoom !== 'なし';
    const isTatamiDropped = plan.warnings.some((w) =>
        w.code.includes('washitsu'),
    );
    const isTatamiOk =
        plan.id === 'plan-b' || isTatamiDropped
            ? true
            : isTatamiExp
              ? tatamiRooms.length >= 1
              : tatamiRooms.length === 0;
    checks.push({
        id: 'room_count_tatami',
        label: '和室の有無',
        expected: isTatamiExp,
        actual: tatamiRooms.length > 0,
        status: isTatamiOk ? 'pass' : 'fail',
    });
    const studyRooms = findRoomsByType(allRooms, 'study');
    const isStudyExp = input.wfh === '書斎が必要';
    const isStudyDropped = plan.warnings.some((w) => w.code.includes('study'));
    const isStudyOk =
        !isStudyExp ||
        studyRooms.length > 0 ||
        plan.id === 'plan-c' ||
        isStudyDropped;
    checks.push({
        id: 'room_count_study',
        label: '書斎の有無',
        expected: isStudyExp,
        actual: studyRooms.length > 0,
        status: isStudyOk ? 'pass' : 'fail',
    });

    // Room Sizes (within ±1 jo, not > 1.5x)
    const ldkJo = ldkRooms[0] ? getRoomJo(ldkRooms[0]) : 0;
    const isLdkOk =
        Math.abs(ldkJo - input.ldkSize) <= 1.0 ||
        plan.warnings.some((w) => w.code === 'ROOM_SIZE_REDUCED:ldk');
    checks.push({
        id: 'room_size_ldk',
        label: 'LDK広さ (±1帖)',
        expected: input.ldkSize,
        actual: ldkJo,
        status: isLdkOk && ldkJo <= input.ldkSize * 1.5 ? 'pass' : 'fail',
    });

    const masterJo = masterRooms[0] ? getRoomJo(masterRooms[0]) : 0;
    const isMasterOk =
        Math.abs(masterJo - input.masterSize) <= 1.0 ||
        plan.warnings.some((w) => w.code === 'ROOM_SIZE_REDUCED:master');
    checks.push({
        id: 'room_size_master',
        label: '主寝室広さ (±1帖)',
        expected: input.masterSize,
        actual: masterJo,
        status:
            isMasterOk && masterJo <= input.masterSize * 1.5 ? 'pass' : 'fail',
    });

    if (input.kidsRooms > 0 && kidsRooms.length > 0) {
        const totalKidsJo = kidsRooms.reduce((s, r) => s + getRoomJo(r), 0);
        const avgKidsJo =
            Math.round((totalKidsJo / kidsRooms.length) * 10) / 10;
        const isKidsSizeOk =
            Math.abs(avgKidsJo - input.kidsSize) <= 1.0 ||
            plan.warnings.some((w) => w.code === 'ROOM_SIZE_REDUCED:kids');
        checks.push({
            id: 'room_size_kids',
            label: '子ども部屋広さ (±1帖)',
            expected: input.kidsSize,
            actual: avgKidsJo,
            status:
                isKidsSizeOk && avgKidsJo <= input.kidsSize * 1.5
                    ? 'pass'
                    : 'fail',
        });
    } else {
        checks.push({
            id: 'room_size_kids',
            label: '子ども部屋広さ (±1帖)',
            expected: 0,
            actual: 0,
            status: 'na',
        });
    }

    return checks;
}
