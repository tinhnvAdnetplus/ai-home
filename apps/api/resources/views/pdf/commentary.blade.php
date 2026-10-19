<div>
    <div class="page-title">06. AI建築講評・提案のポイント</div>
    <div class="section-subtitle">
        AI建築エンジンがお客様のご要望と敷地・法令データを照合して導き出した設計講評です。
    </div>

    <div style="border: 1px solid #cbd5e0; border-left: 5px solid #0b6bdc; background-color: #f8fafc; border-radius: 4px; padding: 12px 16px; margin-bottom: 16px;">
        <div style="font-size: 11pt; font-weight: bold; color: #1a202c; margin-bottom: 6px;">
            {{ $commentary['headline'] }}
        </div>
        <div style="font-size: 8.5pt; color: #4a5568; line-height: 1.65;">
            {{ $commentary['body'] }}
        </div>
    </div>

    <table style="width: 100%; border-collapse: separate; border-spacing: 12px 0;">
        <tr>
            <td style="width: 50%; vertical-align: top;">
                <div style="border: 1px solid #c6f6d5; background-color: #f8fafc; border-radius: 4px;">
                    <div style="background-color: #edfdf2; border-bottom: 1px solid #c6f6d5; padding: 8px 12px; font-weight: bold; color: #22543d; font-size: 9pt;">
                        ✓ 良い点・設計の特長 (Pros)
                    </div>
                    <div style="padding: 12px 14px;">
                        @if(count($commentary['pros']) > 0)
                            @foreach($commentary['pros'] as $pro)
                                <div style="font-size: 8pt; color: #2d3748; line-height: 1.6; margin-bottom: 6px; padding-left: 14px; text-indent: -14px;">
                                    ・{{ $pro }}
                                </div>
                            @endforeach
                        @else
                            <div style="color: #718096; font-size: 8pt;">特長データを整理中</div>
                        @endif
                    </div>
                </div>
            </td>

            <td style="width: 50%; vertical-align: top;">
                <div style="border: 1px solid #feebc8; background-color: #f8fafc; border-radius: 4px;">
                    <div style="background-color: #fffaf0; border-bottom: 1px solid #feebc8; padding: 8px 12px; font-weight: bold; color: #7b341e; font-size: 9pt;">
                        ! 留意点・アドバイス (Cautions)
                    </div>
                    <div style="padding: 12px 14px;">
                        @if(count($commentary['cautions']) > 0)
                            @foreach($commentary['cautions'] as $caution)
                                <div style="font-size: 8pt; color: #2d3748; line-height: 1.6; margin-bottom: 6px; padding-left: 14px; text-indent: -14px;">
                                    ・{{ $caution }}
                                </div>
                            @endforeach
                        @else
                            <div style="color: #718096; font-size: 8pt;">留意点データを整理中</div>
                        @endif
                    </div>
                </div>
            </td>
        </tr>
    </table>
</div>
