<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="utf-8">
    <style>
        @page {
            header: html_BookletHeader;
            footer: html_BookletFooter;
            margin-top: 18mm;
            margin-bottom: 16mm;
            margin-left: 15mm;
            margin-right: 15mm;
        }
        @page :first {
            header: _blank;
            footer: _blank;
            margin-top: 15mm;
            margin-bottom: 15mm;
        }
        body {
            font-family: notosansjp, sans-serif;
            color: #2d3748;
            font-size: 8.5pt;
            line-height: 1.45;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0b6bdc;
            padding-bottom: 4px;
            font-size: 8pt;
        }
        .footer-table {
            width: 100%;
            border-top: 1px solid #cbd5e0;
            padding-top: 4px;
            font-size: 7.5pt;
            color: #718096;
        }
        .page-title {
            color: #0b6bdc;
            font-size: 15pt;
            font-weight: bold;
            margin: 0 0 10px 0;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
        }
        .section-subtitle {
            color: #4a5568;
            font-size: 9pt;
            margin-bottom: 12px;
        }
        .card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px 12px;
            margin-bottom: 10px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
        }
        .data-table th, .data-table td {
            border: 1px solid #e2e8f0;
            padding: 5px 8px;
            text-align: left;
        }
        .data-table th {
            background-color: #edf2f7;
            color: #2d3748;
            font-weight: bold;
        }
        .meter-bar {
            width: 100%;
            height: 9px;
            background-color: #edf2f7;
            border-radius: 3px;
        }
        .meter-fill {
            background-color: #0b6bdc;
            height: 9px;
            border-radius: 3px;
        }
        .badge {
            background-color: #ebf8ff;
            color: #0b6bdc;
            border: 1px solid #bee3f8;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
        }
        .img-container {
            border: 1px solid #cbd5e0;
            background-color: #f7fafc;
            text-align: center;
            border-radius: 4px;
        }
        .img-caption {
            font-size: 8pt;
            color: #4a5568;
            font-weight: bold;
            padding-top: 4px;
            text-align: center;
        }
    </style>
</head>
<body>
    <htmlpageheader name="BookletHeader">
        <table class="header-table">
            <tr>
                <td style="text-align: left; font-weight: bold; color: #0b6bdc;">{{ $project->title }}</td>
                <td style="text-align: right; color: #4a5568; font-weight: bold;">AI HOME PLATFORM</td>
            </tr>
        </table>
    </htmlpageheader>

    <htmlpagefooter name="BookletFooter">
        <table class="footer-table">
            <tr>
                <td style="text-align: left; width: 25%;">{{ $generatedDate }}</td>
                <td style="text-align: center; width: 50%; color: #c53030; font-size: 7pt;">
                    概算・参考図。建築基準法等の確認は設計者が行います。
                </td>
                <td style="text-align: right; width: 25%; font-weight: bold;">{PAGENO} / {nbpg}</td>
            </tr>
        </table>
    </htmlpagefooter>

    @include('pdf.cover')
    <pagebreak />
    @include('pdf.requirements')
    <pagebreak />
    @include('pdf.plan')
    <pagebreak />
    @include('pdf.floorplans')
    <pagebreak />
    @include('pdf.elevations')
    <pagebreak />
    @include('pdf.view3d')
    <pagebreak />
    @include('pdf.commentary')
    <pagebreak />
    @include('pdf.disclaimer')
</body>
</html>
