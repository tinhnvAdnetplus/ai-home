import { type DesignConstraints } from '@aihome/planner';

export type AiSource = 'gemini' | 'claude' | 'local';

export type AiConstraintsResponse = {
    readonly constraints: DesignConstraints;
    readonly source: AiSource;
    readonly isDegraded: boolean;
    readonly model?: string | undefined;
    readonly usage?:
        | {
              readonly inputTokens: number;
              readonly outputTokens: number;
          }
        | undefined;
    readonly requestId?: string | undefined;
};

export type AiCommentaryItem = {
    readonly label: string;
    readonly headline: string;
    readonly body: string;
    readonly pros: readonly string[];
    readonly cautions: readonly string[];
};

export type AiCommentaryResponse = {
    readonly items: readonly AiCommentaryItem[];
    readonly recommendedLabel?: string | undefined;
    readonly source?: AiSource | undefined;
    readonly isDegraded?: boolean | undefined;
    readonly model?: string | undefined;
    readonly usage?:
        | {
              readonly inputTokens: number;
              readonly outputTokens: number;
          }
        | undefined;
    readonly requestId?: string | undefined;
};

export type AnalysisStepId =
    'confirming' | 'analyzing' | 'reviewing' | 'generating' | 'rendering';
