#!/usr/bin/env bash
set -euo pipefail

# Smoke test for T6.5 Proposal Booklet PDF Generation API
# Exercises authentication, project creation, answers, plan upload,
# PDF generation with images & commentary, download flag, role authorization (404),
# image validation (422), and oversized payload rejection (413).

BASE_URL="${BASE_URL:-http://ai-home.test:8080}"

# PHP của Laragon (ghi đè bằng PHP_BIN nếu cần)
PHP_BIN="${PHP_BIN:-$(ls -d /c/laragon/bin/php/php-8.3*/php.exe 2>/dev/null | head -1)}"
[ -n "$PHP_BIN" ] || PHP_BIN="$(command -v php || true)"
php() { "$PHP_BIN" "$@"; }
COOKIE_JAR="/tmp/smoke-report-cookies.txt"

do_curl() {
    curl -s -i -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
        -H "Host: ai-home.test:8080" \
        -H "Origin: http://ai-home.test:8080" \
        -H "Referer: http://ai-home.test:8080/" \
        -H "Accept: application/json" \
        "$@"
}

do_curl_raw() {
    curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
        -H "Host: ai-home.test:8080" \
        -H "Origin: http://ai-home.test:8080" \
        -H "Referer: http://ai-home.test:8080/" \
        -H "Accept: application/json" \
        "$@"
}

get_xsrf() {
    local raw
    raw=$(grep "XSRF-TOKEN" "$COOKIE_JAR" | tail -n 1 | awk '{print $7}' | tr -d '\r')
    php -r "echo urldecode('${raw}');"
}

try_login() {
    local email="$1"
    local password="$2"
    rm -f "$COOKIE_JAR"

    curl -s -c "$COOKIE_JAR" \
        -H "Host: ai-home.test:8080" \
        -H "Origin: http://ai-home.test:8080" \
        -H "Referer: http://ai-home.test:8080/" \
        "${BASE_URL}/sanctum/csrf-cookie" > /dev/null

    local xsrf_token
    xsrf_token=$(get_xsrf)

    local res
    res=$(do_curl -X POST "${BASE_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -H "X-XSRF-TOKEN: ${xsrf_token}" \
        -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")

    local status
    status=$(echo "$res" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
    [ "$status" = "200" ]
}

login() {
    local email="$1"
    local password="$2"
    if ! try_login "$email" "$password"; then
        echo "Failed to login as ${email}"
        exit 1
    fi
}

echo "=== T6.5 Proposal Booklet PDF Smoke Verification ==="

# -------------------------------------------------------------
# 1. Login as user@aihome.local
# -------------------------------------------------------------
echo -n "1. Logging in as user@aihome.local... "
login "user@aihome.local" "Password1234!"
echo "OK"

# -------------------------------------------------------------
# 2. Create Project
# -------------------------------------------------------------
echo -n "2. Creating project for proposal report... "
CREATE_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"title":"T6.5 Smoke Test Residence"}')

STATUS=$(echo "$CREATE_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$CREATE_RES" | sed '1,/^\r\{0,1\}$/d')

if [ "$STATUS" != "201" ]; then
    echo "FAILED: status $STATUS"
    echo "$BODY"
    exit 1
fi

PROJECT_ID=$(php -r '$data = json_decode($argv[1], true); echo $data["data"]["id"] ?? $data["id"] ?? "";' "$BODY")
echo "OK (Project ID: $PROJECT_ID)"

# -------------------------------------------------------------
# 3. Save Answers
# -------------------------------------------------------------
echo -n "3. Saving wizard answers... "
VALID_ANSWERS_RES=$(do_curl -X PUT "${BASE_URL}/api/v1/projects/${PROJECT_ID}/answers" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "answers": {
            "construction_purpose": "new_build",
            "house_type": "custom",
            "floors": "two_story",
            "family_adults": "two",
            "family_children": "two",
            "budget_range": "budget_2500_3500",
            "target_area_range": "area_30_35",
            "house_style": "modern",
            "land_location": "東京都世田谷区",
            "frontage": 10.5
        }
    }')

STATUS=$(echo "$VALID_ANSWERS_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" != "200" ]; then
    echo "FAILED: status $STATUS"
    echo "$VALID_ANSWERS_RES"
    exit 1
fi
echo "OK (status: 200)"

# -------------------------------------------------------------
# 4. Upload Plan
# -------------------------------------------------------------
echo -n "4. Uploading proposal plan... "
UPLOAD_PLAN_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/plans" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "plans": [
            {
                "label": "Plan A - Spacious Modern Living",
                "score": {
                    "comfort": 94,
                    "cost": 86,
                    "flow": 91,
                    "light": 90,
                    "storage": 88
                },
                "model": {
                    "totalFloorAreaM2": 112.5,
                    "buildingCoverageRatio": 54.2,
                    "floorAreaRatio": 95.8,
                    "floors": [
                        {
                            "level": 1,
                            "rooms": [
                                {"name": "LDK (リビング・ダイニング・キッチン)", "areaM2": 32.5},
                                {"name": "洗面脱衣室", "areaM2": 4.5},
                                {"name": "浴室 (1坪タイプ)", "areaM2": 3.3},
                                {"name": "玄関・土間収納", "areaM2": 6.2}
                            ]
                        },
                        {
                            "level": 2,
                            "rooms": [
                                {"name": "主寝室 (WIC付)", "areaM2": 15.2},
                                {"name": "子供部屋1", "areaM2": 9.5},
                                {"name": "子供部屋2", "areaM2": 9.5},
                                {"name": "書斎", "areaM2": 4.8}
                            ]
                        }
                    ],
                    "warnings": []
                }
            }
        ]
    }')

STATUS=$(echo "$UPLOAD_PLAN_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" != "201" ]; then
    echo "FAILED: status $STATUS"
    echo "$UPLOAD_PLAN_RES"
    exit 1
fi
echo "OK (status: 201)"

# -------------------------------------------------------------
# 5. Generate PDF Report (POST /api/v1/projects/{id}/report)
# -------------------------------------------------------------
echo -n "5a. Generating PDF report with 2 PNG images and commentary... "

# 1x1 valid PNG data URLs
PNG_RED="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
PNG_BLUE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

REPORT_PAYLOAD=$(php -r '
$payload = [
    "locale" => "ja",
    "planLabel" => "Plan A - Spacious Modern Living",
    "images" => [
        "plan1f" => $argv[1],
        "view3d" => $argv[2],
    ],
    "commentary" => [
        "headline" => "光と風が通り抜ける開放的な2階建てプラン",
        "body" => "南面に設けた大きな窓から心地よい日差しが差し込み、家事動線をコンパクトに集約した機能的な邸宅です。",
        "pros" => [
            "LDKを広く確保し、家族のコミュニケーションを促進",
            "玄関から洗面・パントリーへの直通動線",
            "将来の家族構成変化に対応できる可変子供部屋"
        ],
        "cautions" => [
            "敷地境界線の測量確定図との最終照合が必要です",
            "建築士による構造計算および斜線制限の確認を実施します"
        ]
    ]
];
echo json_encode($payload);
' "$PNG_RED" "$PNG_BLUE")

do_curl_raw -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/report" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d "$REPORT_PAYLOAD" \
    -o /tmp/smoke-proposal.pdf \
    -D /tmp/smoke-proposal-headers.txt

STATUS=$(grep -i "^HTTP/" /tmp/smoke-proposal-headers.txt | tail -n 1 | awk '{print $2}')
CONTENT_TYPE=$(grep -i "^content-type:" /tmp/smoke-proposal-headers.txt | tail -n 1 | awk '{print $2}' | tr -d '\r')

if [ "$STATUS" = "200" ] && [[ "$CONTENT_TYPE" == *"application/pdf"* ]]; then
    PDF_HEADER=$(head -c 4 /tmp/smoke-proposal.pdf)
    PDF_SIZE=$(wc -c < /tmp/smoke-proposal.pdf | tr -d ' ')
    if [ "$PDF_HEADER" = "%PDF" ]; then
        echo "OK (status: 200, Content-Type: $CONTENT_TYPE, %PDF header valid, size: ${PDF_SIZE} bytes)"
    else
        echo "FAILED: Expected %PDF header, got $PDF_HEADER"
        exit 1
    fi
else
    echo "FAILED: status $STATUS, content-type $CONTENT_TYPE"
    cat /tmp/smoke-proposal.pdf | head -n 30
    exit 1
fi

echo -n "5b. Testing ?download=1 Content-Disposition attachment... "
do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/report?download=1" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"locale":"ja"}' \
    -o /dev/null \
    -D /tmp/smoke-download-headers.txt

DISPOSITION=$(grep -i "^content-disposition:" /tmp/smoke-download-headers.txt | tail -n 1 | tr -d '\r')
if [[ "$DISPOSITION" == *"attachment"* ]]; then
    echo "OK ($DISPOSITION)"
else
    echo "FAILED: expected attachment, got $DISPOSITION"
    exit 1
fi

# -------------------------------------------------------------
# 6. Other user accessing report (expect 404, no existence leak)
# -------------------------------------------------------------
echo -n "6. Other user reading report (expect 404)... "
if ! try_login "otheruser@aihome.local" "Password1234!"; then
    do_curl -X POST "${BASE_URL}/api/v1/auth/register" \
        -H "Content-Type: application/json" \
        -H "X-XSRF-TOKEN: $(get_xsrf)" \
        -d '{
            "name": "Other User",
            "email": "otheruser@aihome.local",
            "password": "Password1234!",
            "password_confirmation": "Password1234!"
        }' > /dev/null
    login "otheruser@aihome.local" "Password1234!"
fi

OTHER_REPORT_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/report" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"locale":"ja"}')

STATUS=$(echo "$OTHER_REPORT_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "404" ]; then
    echo "OK (status: 404 No existence leak)"
else
    echo "FAILED: expected 404, got $STATUS"
    echo "$OTHER_REPORT_RES"
    exit 1
fi

# -------------------------------------------------------------
# 7. Bad Image Validation (expect 422 RFC 9457)
# -------------------------------------------------------------
echo -n "7. Bad image payload with corrupted magic bytes (expect 422)... "
login "user@aihome.local" "Password1234!"

# "not a png" in base64: bm90IGEgcG5n
BAD_IMAGE_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/report" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "images": {
            "plan1f": "data:image/png;base64,bm90IGEgcG5n"
        }
    }')

STATUS=$(echo "$BAD_IMAGE_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$BAD_IMAGE_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "422" ]; then
    echo "OK (status: 422 rejected invalid magic bytes image)"
else
    echo "FAILED: expected 422, got $STATUS"
    echo "$BODY"
    exit 1
fi

# -------------------------------------------------------------
# 8. Huge Body Rejection (expect 413)
# -------------------------------------------------------------
echo -n "8. Body exceeding 6 MB cap (expect 413)... "
php -r '
$huge = str_repeat("a", 6300000);
$payload = json_encode(["pad" => $huge]);
file_put_contents("/tmp/smoke-huge-body.json", $payload);
'

HUGE_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/report" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    --data-binary "@/tmp/smoke-huge-body.json" || true)
rm -f /tmp/smoke-huge-body.json

STATUS=$(echo "$HUGE_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "413" ]; then
    echo "OK (status: 413 payload too large)"
else
    echo "FAILED: expected 413, got $STATUS"
    echo "$HUGE_RES"
    exit 1
fi

echo ""
echo "=== All T6.5 PDF Report Smoke Checks Passed Successfully ==="
