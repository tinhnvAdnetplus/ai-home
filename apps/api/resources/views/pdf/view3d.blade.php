<div>
    <div class="page-title">05. 3D外観パース・空間イメージ</div>
    <div class="section-subtitle">
        3次元デジタルモデリングによる外観ボリュームと空間イメージのスナップショットです。
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
        <tr>
            <td style="width: 100%; height: 95mm; vertical-align: middle; text-align: center; border: 1px solid #cbd5e0; background-color: #f7fafc; border-radius: 4px; padding: 8px;">
                @if(isset($images['view3d']) && $images['view3d'] !== '')
                    <img src="{{ $images['view3d'] }}" style="max-width: 250mm; max-height: 90mm;" alt="3D View" />
                @else
                    <div style="color: #a0aec0; font-size: 9pt;">
                        3D外観パースイメージは未登録または3Dビューアにて閲覧可能です
                    </div>
                @endif
            </td>
        </tr>
        <tr>
            <td style="text-align: center; font-size: 8.5pt; color: #4a5568; font-weight: bold; padding-top: 6px;">
                外観パース (3D Perspective View)
            </td>
        </tr>
    </table>

    <div class="card" style="margin-top: 6px; font-size: 8pt; color: #4a5568;">
        <span style="font-weight: bold; color: #0b6bdc;">デザインコンセプト:</span>
        周囲の街並みと調和する端正なプロポーションと、プライバシーを確保しつつ自然光を取り入れる開口部計画を採用。シンプルで飽きのこないモダンなファサードを形成しています。
    </div>
</div>
