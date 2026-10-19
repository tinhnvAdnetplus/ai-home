<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\GenerateReportRequest;
use App\Models\Project;
use App\Reports\ProposalReport;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ProjectReportController extends Controller
{
    /**
     * Generate an architectural proposal booklet PDF for the specified project.
     *
     * Owner-only via project ownership policy. Non-owners receive 404
     * to avoid leaking resource existence.
     */
    public function __invoke(
        GenerateReportRequest $request,
        int $id,
        ProposalReport $reportGenerator
    ): Response {
        $project = $this->findOwnedProject($request, $id);

        /** @var array<string, mixed> $validated */
        $validated = $request->validated();
        $pdfContent = $reportGenerator->generate($project, $validated);

        $isDownload = $request->query('download') === '1' || $request->boolean('download');
        $disposition = $isDownload ? 'attachment' : 'inline';
        $filename = "proposal-{$project->id}.pdf";

        return new Response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
            'Content-Length' => (string) strlen($pdfContent),
        ]);
    }

    /**
     * Find a project the current user may generate a report for, or throw 404.
     *
     * Anonymous callers (no authenticated user) get full access to any
     * project by design — see App\Support\GuestAccess.
     */
    private function findOwnedProject(GenerateReportRequest $request, int $id): Project
    {
        $project = Project::find($id);
        if ($project === null) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        $user = $request->user();
        if ($user === null) {
            return $project;
        }

        if ($project->user_id !== $user->id) {
            throw new NotFoundHttpException('The requested resource was not found.');
        }

        return $project;
    }
}
