<div>
    <div class="page-title">01. お客様のご要望一覧</div>
    <div class="section-subtitle">
        ヒアリングウィザードにて入力・選択いただいた設計条件およびライフスタイルのご希望です。
    </div>

    @if(count($requirements) > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25%;">項目カテゴリー</th>
                    <th style="width: 35%;">ご要望項目</th>
                    <th style="width: 40%;">ご回答・希望内容</th>
                </tr>
            </thead>
            <tbody>
                @foreach(array_slice($requirements, 0, 16) as $req)
                    <tr>
                        <td style="color: #718096; font-size: 7.5pt;">{{ $req['section'] !== '' ? $req['section'] : '基本条件' }}</td>
                        <td style="font-weight: bold; color: #2d3748;">{{ $req['label'] }}</td>
                        <td style="color: #1a202c;">{{ $req['value'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        @if(count($requirements) > 16)
            <div style="margin-top: 6px; font-size: 7.5pt; color: #718096; text-align: right;">
                ※他 {{ count($requirements) - 16 }} 項目の詳細条件はシステムデータベースに保存されています。
            </div>
        @endif
    @else
        <div class="card" style="text-align: center; padding: 25px; color: #718096;">
            登録された詳細要件情報がありません。
        </div>
    @endif
</div>
