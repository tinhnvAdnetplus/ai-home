<div>
    <div class="page-title">03. 平面図 (1F / 2F Floor Plans)</div>
    <div class="section-subtitle">
        生活動線・採光・収納スペースを最適化した各階の基本レイアウト図面です。
    </div>

    <table style="width: 100%; border-collapse: separate; border-spacing: 12px 0;">
        <tr>
            <td style="width: 50%; height: 115mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 8px;">
                @if(isset($images['plan1f']) && $images['plan1f'] !== '')
                    <img src="{{ $images['plan1f'] }}" style="max-width: 120mm; max-height: 105mm;" alt="1F Plan" />
                @else
                    <div style="color: #a0aec0; font-size: 9pt;">
                        1階平面図イメージは未登録または生成中です
                    </div>
                @endif
            </td>

            <td style="width: 50%; height: 115mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 8px;">
                @if(isset($images['plan2f']) && $images['plan2f'] !== '')
                    <img src="{{ $images['plan2f'] }}" style="max-width: 120mm; max-height: 105mm;" alt="2F Plan" />
                @else
                    <div style="color: #a0aec0; font-size: 9pt;">
                        2階平面図イメージは未登録または平屋プランです
                    </div>
                @endif
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 8.5pt; color: #4a5568; font-weight: bold; padding-top: 6px;">
                1階 平面図 (1F Layout)
            </td>
            <td style="text-align: center; font-size: 8.5pt; color: #4a5568; font-weight: bold; padding-top: 6px;">
                2階 平面図 (2F Layout)
            </td>
        </tr>
    </table>
</div>
