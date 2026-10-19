import { type Plan } from '@aihome/planner';
import { AiCommentaryCard, type AiCommentaryItem } from '@/features/ai';
import { PlanComparisonCard } from './PlanComparisonCard';
import { ScoreSection } from './ScoreSection';
import { WarningsList } from './WarningsList';
import { PlanSummaryCard } from './PlanSummaryCard';

type PlanResultsSidebarProps = {
    readonly commentary?: AiCommentaryItem | undefined;
    readonly isCommentaryLoading: boolean;
    readonly isCommentaryError: boolean;
    readonly onRetryCommentary: () => void;
    readonly answers: Record<string, unknown>;
    readonly plan: Plan;
};

export function PlanResultsSidebar({
    commentary,
    isCommentaryLoading,
    isCommentaryError,
    onRetryCommentary,
    answers,
    plan,
}: PlanResultsSidebarProps): React.JSX.Element {
    return (
        <div className="space-y-4 w-full min-w-0">
            <AiCommentaryCard
                item={commentary}
                isLoading={isCommentaryLoading}
                isError={isCommentaryError}
                onRetry={onRetryCommentary}
            />
            <PlanComparisonCard answers={answers} plan={plan} />
            <ScoreSection score={plan.score} />
            <PlanSummaryCard
                summary={plan.summary}
                model={plan.model}
                plan={plan}
                answers={answers}
            />
            <WarningsList warnings={plan.warnings} />
        </div>
    );
}
