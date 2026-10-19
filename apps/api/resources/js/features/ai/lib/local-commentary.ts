import { type Plan } from '@aihome/planner';
import { type AiCommentaryResponse } from '../types';

export function buildLocalCommentary(
    plans: readonly Plan[],
): AiCommentaryResponse {
    const items = plans.slice(0, 3).map((p, idx) => {
        if (idx === 0) {
            return {
                label: p.label,
                headline: '開放的なLDKと家事動線を両立した快適プラン',
                body: `${p.summary.tsubo.toString()}坪（${p.summary.floorAreaM2.toString()}m²）のゆとりある空間設計。南面からの採光を最大化し、回遊動線により家事時間を短縮します。`,
                pros: [
                    'キッチンから水回りへの効率的な直線動線',
                    '日当たり良好な広々としたLDK空間',
                ],
                cautions: [
                    '玄関ホール付近の収納配置について必要に応じて追加をご検討ください',
                ],
            };
        }
        if (idx === 1) {
            return {
                label: p.label,
                headline: 'プライベート空間と充実した収納を重視したプラン',
                body: `${p.summary.tsubo.toString()}坪の配置で、各居室のプライバシーを確保しつつ適材適所に大容量の収納スペースを確保しています。`,
                pros: [
                    '各個室の独立性が高くテレワークにも最適',
                    '豊富な収納スペース',
                ],
                cautions: ['廊下面積がやや広めのため動線をご確認ください'],
            };
        }
        return {
            label: p.label,
            headline: '無駄を省いた高効率なスマートエコノミープラン',
            body: `${p.summary.tsubo.toString()}坪のコンパクトかつ機能的な構成。構造のシンプルさによりコストバランスにも優れています。`,
            pros: ['建築コストの抑制と高い構造安定性', '無駄のない空間活用'],
            cautions: ['家具レイアウトの事前シミュレーションをおすすめします'],
        };
    });

    let bestPlan = plans[0];
    for (const p of plans) {
        if (p.score.total > (bestPlan?.score.total ?? -1)) {
            bestPlan = p;
        }
    }

    return {
        items,
        recommendedLabel: bestPlan?.label ?? plans[0]?.label ?? 'A',
        source: 'local',
        isDegraded: true,
    };
}
