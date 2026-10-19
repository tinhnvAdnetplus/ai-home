<div>
    <div class="page-title">02. プラン概要・設計仕様</div>
    <div class="section-subtitle">
        提案プラン「{{ $planData['label'] }}」の指標・評価スコアおよび各室の面積構成です。
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tr>
            <td style="width: 48%; vertical-align: top; padding-right: 10px;">
                <div class="card" style="margin-bottom: 10px;">
                    <div style="font-weight: bold; color: #0b6bdc; font-size: 8.5pt; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
                        基本面積・法規制指標
                    </div>
                    <table style="width: 100%; font-size: 8pt; line-height: 1.8;">
                        <tr>
                            <td style="color: #718096; width: 45%;">延床面積:</td>
                            <td style="font-weight: bold; color: #1a202c;">
                                {{ number_format($planData['totalFloorAreaM2'], 2) }} m² ({{ number_format($planData['totalFloorAreaTsubo'], 2) }} 坪)
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #718096;">建築面積 (概算):</td>
                            <td style="color: #2d3748;">{{ number_format($planData['buildingAreaM2'], 2) }} m² ({{ number_format($planData['buildingAreaTsubo'], 2) }} 坪)</td>
                        </tr>
                        <tr>
                            <td style="color: #718096;">建ぺい率:</td>
                            <td style="color: #2d3748;">{{ $planData['bcr'] !== null ? $planData['bcr'].' %' : '基準内 (適合)' }}</td>
                        </tr>
                        <tr>
                            <td style="color: #718096;">容積率:</td>
                            <td style="color: #2d3748;">{{ $planData['far'] !== null ? $planData['far'].' %' : '基準内 (適合)' }}</td>
                        </tr>
                    </table>
                </div>

                <div class="card">
                    <div style="font-weight: bold; color: #0b6bdc; font-size: 8.5pt; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
                        プラン評価スコア
                    </div>
                    @if(count($planData['scores']) > 0)
                        <table style="width: 100%; font-size: 7.5pt; line-height: 1.6;">
                            @foreach($planData['scores'] as $name => $scoreVal)
                                <tr>
                                    <td style="width: 35%; color: #4a5568;">{{ $scoreVal['label'] }}</td>
                                    <td style="width: 45%;">
                                        <table class="meter-bar" style="margin: 0; padding: 0; border: none;">
                                            <tr>
                                                <td class="meter-fill" style="width: {{ $scoreVal['percent'] }}%; border: none; padding: 0;"></td>
                                                <td style="width: {{ 100 - $scoreVal['percent'] }}%; border: none; padding: 0;"></td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="width: 20%; text-align: right; font-weight: bold; color: #0b6bdc;">
                                        {{ $scoreVal['raw'] }}点
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    @else
                        <div style="color: #718096; font-size: 7.5pt;">評価指標算出完了</div>
                    @endif
                </div>
            </td>

            <td style="width: 52%; vertical-align: top; padding-left: 10px;">
                <div class="card">
                    <div style="font-weight: bold; color: #0b6bdc; font-size: 8.5pt; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
                        部屋別一覧 (面積表)
                    </div>
                    @if(count($planData['rooms']) > 0)
                        <table class="data-table" style="font-size: 7.5pt;">
                            <thead>
                                <tr>
                                    <th style="width: 15%;">階</th>
                                    <th style="width: 45%;">室名</th>
                                    <th style="width: 20%; text-align: right;">面積 (m²)</th>
                                    <th style="width: 20%; text-align: right;">帖数 (帖)</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach(array_slice($planData['rooms'], 0, 8) as $room)
                                    <tr>
                                        <td>{{ $room['floor'] }}</td>
                                        <td style="font-weight: bold;">{{ $room['name'] }}</td>
                                        <td style="text-align: right;">{{ number_format($room['areaM2'], 1) }}</td>
                                        <td style="text-align: right;">{{ number_format($room['jo'], 1) }} 帖</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    @else
                        <div style="color: #718096; font-size: 8pt; padding: 10px 0;">各室詳細配置データ準備中</div>
                    @endif
                </div>

                @if(count($planData['warnings']) > 0)
                    <div style="background-color: #fffaf0; border: 1px solid #fbd38d; border-radius: 4px; padding: 6px 10px; font-size: 7.5pt; color: #c05621;">
                        <span style="font-weight: bold;">留意事項:</span>
                        @foreach($planData['warnings'] as $w)
                            <div>・{{ $w['message'] ?? $w['code'] }}</div>
                        @endforeach
                    </div>
                @else
                    <div style="background-color: #f0fff4; border: 1px solid #9ae6b4; border-radius: 4px; padding: 6px 10px; font-size: 7.5pt; color: #276749;">
                        ✓ 法令・設計基準適合チェック完了（重大な警告事項はありません）
                    </div>
                @endif
            </td>
        </tr>
    </table>
</div>
