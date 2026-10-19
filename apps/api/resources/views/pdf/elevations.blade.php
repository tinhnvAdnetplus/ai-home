<div>
    <div class="page-title">04. 四方立面図 (Elevations)</div>
    <div class="section-subtitle">
        建物の四方（南・北・東・西）の外観プロポーションおよび開口部配置です。
    </div>

    <table style="width: 100%; border-collapse: separate; border-spacing: 12px 4px;">
        <tr>
            <td style="width: 50%; height: 48mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 6px;">
                @if(isset($images['elevS']) && $images['elevS'] !== '')
                    <img src="{{ $images['elevS'] }}" style="max-width: 120mm; max-height: 44mm;" alt="South" />
                @else
                    <div style="color: #a0aec0; font-size: 8pt;">南立面図 未登録</div>
                @endif
            </td>
            <td style="width: 50%; height: 48mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 6px;">
                @if(isset($images['elevN']) && $images['elevN'] !== '')
                    <img src="{{ $images['elevN'] }}" style="max-width: 120mm; max-height: 44mm;" alt="North" />
                @else
                    <div style="color: #a0aec0; font-size: 8pt;">北立面図 未登録</div>
                @endif
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 8pt; color: #4a5568; font-weight: bold; padding-bottom: 6px;">
                南立面図 (South Elevation)
            </td>
            <td style="text-align: center; font-size: 8pt; color: #4a5568; font-weight: bold; padding-bottom: 6px;">
                北立面図 (North Elevation)
            </td>
        </tr>
        <tr>
            <td style="width: 50%; height: 48mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 6px;">
                @if(isset($images['elevE']) && $images['elevE'] !== '')
                    <img src="{{ $images['elevE'] }}" style="max-width: 120mm; max-height: 44mm;" alt="East" />
                @else
                    <div style="color: #a0aec0; font-size: 8pt;">東立面図 未登録</div>
                @endif
            </td>
            <td style="width: 50%; height: 48mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 6px;">
                @if(isset($images['elevW']) && $images['elevW'] !== '')
                    <img src="{{ $images['elevW'] }}" style="max-width: 120mm; max-height: 44mm;" alt="West" />
                @else
                    <div style="color: #a0aec0; font-size: 8pt;">西立面図 未登録</div>
                @endif
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 8pt; color: #4a5568; font-weight: bold;">
                東立面図 (East Elevation)
            </td>
            <td style="text-align: center; font-size: 8pt; color: #4a5568; font-weight: bold;">
                西立面図 (West Elevation)
            </td>
        </tr>
    </table>
</div>
