import { renderAllElevations } from '@aihome/elevation';
import { type Plan } from '@aihome/planner';
import { type MaterialOptions } from '@aihome/render3d';
import { apiClientBlob } from '@/shared/api';
import {
    persistProjectAnswers,
    submitProjectWithPlans,
} from '@/features/projects';
import { downloadBlob } from './export-helpers';
import { svgStringToPngDataUrl, get3dCanvasSnapshot } from './image-rasterize';

export type PdfExportOptions = {
    readonly projectId: number | null;
    readonly plan: Plan;
    readonly answers?: Record<string, unknown> | undefined;
    readonly materials?: MaterialOptions | undefined;
    readonly getSvgElement?: (() => SVGSVGElement | null) | undefined;
    readonly commentary?:
        | {
              readonly headline: string;
              readonly body: string;
              readonly pros: readonly string[];
              readonly cautions: readonly string[];
          }
        | undefined;
    readonly locale?: string | undefined;
};

export async function exportProposalPdf(
    options: PdfExportOptions,
): Promise<void> {
    const {
        projectId,
        plan,
        answers,
        materials,
        getSvgElement,
        commentary,
        locale,
    } = options;

    const targetProjectId =
        projectId ??
        (await (async () => {
            const persisted = await persistProjectAnswers(null, answers ?? {});
            await submitProjectWithPlans(persisted.id, [
                {
                    label: plan.label,
                    score: { ...plan.score },
                    model: { ...plan.model },
                },
            ]);
            return persisted.id;
        })());

    const elevations = renderAllElevations(plan.model, {
        wallColor: materials?.wall,
        roofColor: materials?.roof,
    });

    const [elevS, elevN, elevE, elevW] = await Promise.all([
        svgStringToPngDataUrl(elevations.south),
        svgStringToPngDataUrl(elevations.north),
        svgStringToPngDataUrl(elevations.east),
        svgStringToPngDataUrl(elevations.west),
    ]);

    const images: Record<string, string> = {
        elevS,
        elevN,
        elevE,
        elevW,
    };

    const svgEl = getSvgElement?.();
    if (svgEl) {
        const serializer = new XMLSerializer();
        const svgStr = serializer.serializeToString(svgEl);
        const plan1f = await svgStringToPngDataUrl(svgStr);
        images.plan1f = plan1f;
    }

    const view3d = get3dCanvasSnapshot();
    if (view3d) {
        images.view3d = view3d;
    }

    const payload = {
        locale: locale ?? 'ja',
        planLabel: plan.label,
        images,
        commentary: commentary
            ? {
                  headline: commentary.headline,
                  body: commentary.body,
                  pros: commentary.pros,
                  cautions: commentary.cautions,
              }
            : undefined,
    };

    const blob = await apiClientBlob(
        `/api/v1/projects/${targetProjectId.toString()}/report?download=1`,
        {
            method: 'POST',
            body: payload,
        },
    );

    downloadBlob(blob, `proposal-${plan.id}.pdf`);
}
