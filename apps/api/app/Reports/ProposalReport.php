<?php

declare(strict_types=1);

namespace App\Reports;

use App\Models\Project;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
use Mpdf\Mpdf;

final class ProposalReport
{
    public function __construct(
        private readonly ProposalDataBuilder $dataBuilder
    ) {
    }

    /**
     * Generate the complete PDF proposal booklet as a binary string.
     *
     * @param array<string, mixed> $data
     */
    public function generate(Project $project, array $data): string
    {
        $viewData = $this->dataBuilder->build($project, $data);
        $html = view('pdf.document', $viewData)->render();

        $mpdf = $this->createMpdf();
        $mpdf->WriteHTML($html);

        return $mpdf->Output('', 'S');
    }

    /**
     * Initialize mPDF with Japanese Noto Sans JP fonts and A4 landscape configuration.
     */
    private function createMpdf(): Mpdf
    {
        $defaultConfig = (new ConfigVariables())->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new FontVariables())->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        $tempDir = storage_path('app/mpdf');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        return new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4-L',
            'orientation' => 'L',
            'margin_top' => 18,
            'margin_bottom' => 16,
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_header' => 6,
            'margin_footer' => 6,
            'tempDir' => $tempDir,
            'fontDir' => array_merge($fontDirs, [
                resource_path('fonts'),
            ]),
            'fontdata' => $fontData + [
                'notosansjp' => [
                    'R' => 'NotoSansJP-Regular.ttf',
                    'B' => 'NotoSansJP-Regular.ttf',
                ],
            ],
            'default_font' => 'notosansjp',
            'autoScriptToLang' => true,
            'autoLangToFont' => true,
        ]);
    }
}
