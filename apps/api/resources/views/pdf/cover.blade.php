<div style="padding-top: 15mm; text-align: center;">
    <div style="font-size: 11pt; letter-spacing: 2px; color: #0b6bdc; font-weight: bold; margin-bottom: 8px;">
        AI HOME PLATFORM
    </div>
    <div style="font-size: 26pt; font-weight: bold; color: #1a202c; margin-bottom: 12px; letter-spacing: 1px;">
        建築提案書
    </div>
    <div style="font-size: 13pt; color: #4a5568; margin-bottom: 25px;">
        {{ $project->title }}
    </div>

    <div style="display: inline-block; background-color: #ebf8ff; border: 1.5px solid #0b6bdc; color: #0b6bdc; font-weight: bold; font-size: 11pt; padding: 6px 18px; border-radius: 20px; margin-bottom: 25px;">
        提案プラン: {{ $planData['label'] }}
    </div>

    <div style="width: 80%; margin: 0 auto; text-align: left; background-color: #f8fafc; border: 1px solid #cbd5e0; border-radius: 6px; padding: 16px 20px;">
        <div style="font-size: 10pt; font-weight: bold; color: #2d3748; border-bottom: 1.5px solid #0b6bdc; padding-bottom: 6px; margin-bottom: 12px;">
            お客様ご要望概要 (サマリー)
        </div>
        <table style="width: 100%; font-size: 8.5pt; line-height: 1.8;">
            <tr>
                <td style="width: 25%; color: #718096; font-weight: bold;">建築予定地:</td>
                <td style="width: 25%; color: #2d3748;">{{ $summary['location'] ?? '計画地（未定）' }}</td>
                <td style="width: 25%; color: #718096; font-weight: bold;">延床面積目安:</td>
                <td style="width: 25%; color: #2d3748;">{{ $summary['targetArea'] ?? '約30〜35坪' }}</td>
            </tr>
            <tr>
                <td style="color: #718096; font-weight: bold;">階数・工法:</td>
                <td style="color: #2d3748;">{{ $summary['floors'] ?? '2階建て (木造軸組)' }}</td>
                <td style="color: #718096; font-weight: bold;">ご予算帯:</td>
                <td style="color: #2d3748;">{{ $summary['budget'] ?? '2,500万〜3,500万円' }}</td>
            </tr>
            <tr>
                <td style="color: #718096; font-weight: bold;">家族構成:</td>
                <td style="color: #2d3748;">{{ $summary['family'] ?? '4人 (大人2名・子供2名)' }}</td>
                <td style="color: #718096; font-weight: bold;">希望テイスト:</td>
                <td style="color: #2d3748;">{{ $summary['style'] ?? 'モダン・ナチュラル' }}</td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 35px; font-size: 8pt; color: #718096;">
        <p style="margin: 3px 0;">発行日: {{ $generatedDate }}</p>
        <p style="margin: 3px 0; color: #c53030; font-weight: bold;">
            ※ 検討用プランです。建築基準法等の確認および構造検討は建築士が行います。
        </p>
    </div>
</div>
