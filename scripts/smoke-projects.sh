#!/usr/bin/env bash
set -euo pipefail

# Smoke test for T4.1 Projects API
# Exercises authentication, CRUD, answers validation, submit, plan upload, role access, and error paths.

BASE_URL="${BASE_URL:-http://ai-home.test:8080}"
COOKIE_JAR="/tmp/smoke-cookies.txt"

# PHP của Laragon (ghi đè bằng PHP_BIN nếu cần)
PHP_BIN="${PHP_BIN:-$(ls -d /c/laragon/bin/php/php-8.3*/php.exe 2>/dev/null | head -1)}"
[ -n "$PHP_BIN" ] || PHP_BIN="$(command -v php || true)"
php() { "$PHP_BIN" "$@"; }

# Helper for curl inside container
do_curl() {
    curl -s -i -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
        -H "Host: ai-home.test:8080" \
        -H "Origin: http://ai-home.test:8080" \
        -H "Referer: http://ai-home.test:8080/" \
        -H "Accept: application/json" \
        "$@"
}

login() {
    local email="$1"
    local password="$2"
    rm -f "$COOKIE_JAR"

    # 1. Fetch CSRF cookie
    curl -s -c "$COOKIE_JAR" \
        -H "Host: ai-home.test:8080" \
        -H "Origin: http://ai-home.test:8080" \
        -H "Referer: http://ai-home.test:8080/" \
        "${BASE_URL}/sanctum/csrf-cookie" > /dev/null

    local xsrf_token
    xsrf_token=$(grep "XSRF-TOKEN" "$COOKIE_JAR" | tail -n 1 | awk '{print $7}' | tr -d '\r')
    if [ -n "$xsrf_token" ]; then
        xsrf_token=$(php -r "echo urldecode('${xsrf_token}');")
    fi

    # 2. Login
    local res
    res=$(do_curl -X POST "${BASE_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -H "X-XSRF-TOKEN: ${xsrf_token}" \
        -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")

    local status
    status=$(echo "$res" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
    if [ "$status" != "200" ]; then
        echo "Failed to login as ${email} (status: ${status})"
        echo "$res"
        exit 1
    fi
}

get_xsrf() {
    local raw
    raw=$(grep "XSRF-TOKEN" "$COOKIE_JAR" | tail -n 1 | awk '{print $7}' | tr -d '\r')
    php -r "echo urldecode('${raw}');"
}

echo "=== T4.1 Projects API Smoke Verification ==="

# -------------------------------------------------------------
# 1. Login as user@aihome.local
# -------------------------------------------------------------
echo -n "1. Logging in as user@aihome.local... "
login "user@aihome.local" "Password1234!"
echo "OK"

# -------------------------------------------------------------
# 2. Create Project (POST /api/v1/projects)
# -------------------------------------------------------------
echo -n "2. Creating project... "
CREATE_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"title":"Smoke Test Residence"}')

STATUS=$(echo "$CREATE_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$CREATE_RES" | sed '1,/^\r\{0,1\}$/d')

if [ "$STATUS" != "201" ]; then
    echo "FAILED: status $STATUS"
    echo "$BODY"
    exit 1
fi

PROJECT_ID=$(php -r '$data = json_decode($argv[1], true); echo $data["data"]["id"] ?? $data["id"] ?? "";' "$BODY")
echo "OK (Project ID: $PROJECT_ID, Status: $STATUS)"

# -------------------------------------------------------------
# 3. Save Answers (PUT /api/v1/projects/{id}/answers)
# -------------------------------------------------------------
echo -n "3a. Saving valid partial draft answers... "
VALID_ANSWERS_RES=$(do_curl -X PUT "${BASE_URL}/api/v1/projects/${PROJECT_ID}/answers" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"answers":{"floors":"two_story","frontage":10.5,"construction_purpose":"new_build"}}')

STATUS=$(echo "$VALID_ANSWERS_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" != "200" ]; then
    echo "FAILED: status $STATUS"
    echo "$VALID_ANSWERS_RES"
    exit 1
fi
echo "OK (status: $STATUS)"

echo -n "3b. Saving invalid option (expect 422 OPTION_NOT_ALLOWED)... "
INVALID_OPT_RES=$(do_curl -X PUT "${BASE_URL}/api/v1/projects/${PROJECT_ID}/answers" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"answers":{"floors":"five_story_skyscraper"}}')

STATUS=$(echo "$INVALID_OPT_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$INVALID_OPT_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "422" ]; then
    echo "OK (status: 422 rejected invalid option)"
else
    echo "FAILED: expected 422, got $STATUS"
    echo "$BODY"
    exit 1
fi

echo -n "3c. Saving hostile huge value (expect 422 OUT_OF_RANGE)... "
HUGE_VAL_RES=$(do_curl -X PUT "${BASE_URL}/api/v1/projects/${PROJECT_ID}/answers" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{"answers":{"frontage":999999999}}')

STATUS=$(echo "$HUGE_VAL_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$HUGE_VAL_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "422" ]; then
    echo "OK (status: 422 rejected hostile out of range value)"
else
    echo "FAILED: expected 422, got $STATUS"
    echo "$BODY"
    exit 1
fi

# -------------------------------------------------------------
# 4. Submit with missing required (POST /api/v1/projects/{id}/submit)
# -------------------------------------------------------------
echo -n "4. Submitting with missing required answers (expect 422)... "
SUBMIT_FAIL_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/submit" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)")

STATUS=$(echo "$SUBMIT_FAIL_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$SUBMIT_FAIL_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "422" ]; then
    echo "OK (status: 422 rejected incomplete answers)"
else
    echo "FAILED: expected 422, got $STATUS"
    echo "$BODY"
    exit 1
fi

# -------------------------------------------------------------
# 5. Submit OK with complete required answers
# -------------------------------------------------------------
echo -n "5. Submitting with all required answers completed... "
COMPLETE_ANSWERS='{
    "answers": {
        "construction_purpose": "new_build",
        "house_type": "custom",
        "floors": "two_story",
        "family_adults": "two",
        "family_children": "two",
        "budget_range": "budget_2500_3500",
        "target_area_range": "area_30_35",
        "house_style": "modern",
        "notes_step1": "Sample text",
        "land_location": "Sample text",
        "land_area": 10,
        "land_shape": "rectangle",
        "frontage": 10.5,
        "depth": 15,
        "road_side": "south",
        "road_width": 4,
        "land_elevation": "flat",
        "surroundings": ["residential"],
        "plan_type": "one_story",
        "plan_target_area": 30,
        "plan_ldk_count": "count_1",
        "plan_ldk_size": "size_18",
        "plan_master_bedroom_count": "count_1",
        "plan_master_bedroom_size": "size_8",
        "plan_kids_room_count": "count_2",
        "plan_kids_room_size": "size_6",
        "plan_tatami_count": "count_0",
        "plan_tatami_size": "size_3_4_5",
        "plan_study_count": "count_0",
        "plan_study_size": "size_2_3",
        "plan_other_room_count": "count_0",
        "plan_other_room_size": "size_4_5",
        "plan_kitchen": "counter",
        "plan_bath": "size_1_0",
        "plan_washroom": "size_1",
        "plan_toilet": "two_floors",
        "plan_storage": ["walkin_closet", "pantry"],
        "plan_parking_count": "cars_2",
        "plan_parking_options": ["carport"],
        "life_priorities": ["family_communication", "housework_flow"],
        "life_flow": ["wash_from_entry"],
        "life_spaces": ["workspace"],
        "life_pets": ["dog"],
        "life_parking": ["cars_2"],
        "life_work": "dedicated_room",
        "life_future": "continue_after_independence",
        "life_notes": "Sample text",
        "design_exterior_style": ["modern"],
        "design_interior_style": ["natural"],
        "design_exterior_wall_color": ["white"],
        "design_roof_color": ["black"],
        "design_flooring_material": "natural",
        "design_wall_color": "bright",
        "design_features": ["large_window"],
        "design_favorite_photos": ["photo_modern_exterior"],
        "design_notes": "Sample text"
    }
}'

SUBMIT_OK_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/submit" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d "$COMPLETE_ANSWERS")

STATUS=$(echo "$SUBMIT_OK_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$SUBMIT_OK_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "200" ]; then
    PROJECT_STATUS=$(php -r '$d = json_decode($argv[1], true); echo $d["data"]["status"] ?? $d["status"] ?? "";' "$BODY")
    CONFIG_VER=$(php -r '$d = json_decode($argv[1], true); echo $d["data"]["config_version"] ?? $d["config_version"] ?? "";' "$BODY")
    echo "OK (status: 200, project_status: $PROJECT_STATUS, config_version: $CONFIG_VER)"
else
    echo "FAILED: expected 200, got $STATUS"
    echo "$BODY"
    exit 1
fi

# -------------------------------------------------------------
# 6. Another user reading it (expect 404, no existence leak)
# -------------------------------------------------------------
echo -n "6a. Registering another user (otheruser@aihome.local)... "
REGISTER_RES=$(do_curl -X POST "${BASE_URL}/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "name": "Other User",
        "email": "otheruser@aihome.local",
        "password": "Password1234!",
        "password_confirmation": "Password1234!"
    }')
echo "OK"

echo -n "6b. Logging in as otheruser@aihome.local... "
login "otheruser@aihome.local" "Password1234!"
echo "OK"

echo -n "6c. Other user reading User A project (expect 404)... "
OTHER_READ_RES=$(do_curl -X GET "${BASE_URL}/api/v1/projects/${PROJECT_ID}")
STATUS=$(echo "$OTHER_READ_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "404" ]; then
    echo "OK (status: 404 No existence leak)"
else
    echo "FAILED: expected 404, got $STATUS"
    exit 1
fi

# -------------------------------------------------------------
# 7. Admin lists all projects (GET /api/v1/admin/projects)
# -------------------------------------------------------------
echo -n "7a. Logging in as admin@aihome.local... "
login "admin@aihome.local" "Password1234!"
echo "OK"

echo -n "7b. Admin reading project list... "
ADMIN_LIST_RES=$(do_curl -X GET "${BASE_URL}/api/v1/admin/projects?status=submitted")
STATUS=$(echo "$ADMIN_LIST_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$ADMIN_LIST_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "200" ]; then
    TOTAL=$(php -r '$d = json_decode($argv[1], true); echo $d["meta"]["total"] ?? 0;' "$BODY")
    echo "OK (status: 200, total submitted projects: $TOTAL)"
else
    echo "FAILED: expected 200, got $STATUS"
    exit 1
fi

# -------------------------------------------------------------
# 8. Plan Upload for User A
# -------------------------------------------------------------
echo -n "8a. Logging back in as user@aihome.local... "
login "user@aihome.local" "Password1234!"
echo "OK"

echo -n "8b. Uploading valid plan... "
VALID_PLAN_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/plans" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "plans": [
            {
                "label": "Plan A - Spacious Living",
                "score": {"comfort": 92, "cost": 85},
                "model": {"buildingCoverageRatio": 50, "floorAreaRatio": 100, "rooms": ["LDK", "MasterBedroom"]}
            }
        ]
    }')

STATUS=$(echo "$VALID_PLAN_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$VALID_PLAN_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "201" ]; then
    MODEL_HASH=$(php -r '$d = json_decode($argv[1], true); echo $d["data"][0]["model_hash"] ?? "";' "$BODY")
    PLAN_ID=$(php -r '$d = json_decode($argv[1], true); echo $d["data"][0]["id"] ?? "";' "$BODY")
    echo "OK (status: 201, model_hash: $MODEL_HASH, plan_id: $PLAN_ID)"
else
    echo "FAILED: expected 201, got $STATUS"
    echo "$BODY"
    exit 1
fi

echo -n "8c. Uploading plan with model as string (expect 422)... "
STRING_MODEL_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/plans" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    -d '{
        "plans": [
            {
                "label": "Invalid Model String",
                "model": "this is a string, not an object"
            }
        ]
    }')

STATUS=$(echo "$STRING_MODEL_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
BODY=$(echo "$STRING_MODEL_RES" | sed '1,/^\r\{0,1\}$/d')
if [ "$STATUS" = "422" ]; then
    echo "OK (status: 422 rejected non-object model)"
else
    echo "FAILED: expected 422, got $STATUS"
    echo "$BODY"
    exit 1
fi

echo -n "8d. Uploading plan with oversized 3 MB body (expect 413 or 422)... "
php -r '
$huge = str_repeat("a", 2600000);
$payload = json_encode([
    "plans" => [
        [
            "label" => "Too Big",
            "model" => ["pad" => $huge]
        ]
    ]
]);
file_put_contents("/tmp/oversized-plan.json", $payload);
'

OVERSIZED_RES=$(do_curl -X POST "${BASE_URL}/api/v1/projects/${PROJECT_ID}/plans" \
    -H "Content-Type: application/json" \
    -H "X-XSRF-TOKEN: $(get_xsrf)" \
    --data-binary "@/tmp/oversized-plan.json" || true)
rm -f "/tmp/oversized-plan.json"

STATUS=$(echo "$OVERSIZED_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "413" ] || [ "$STATUS" = "422" ]; then
    echo "OK (status: $STATUS rejected payload exceeding 2 MB size cap)"
else
    echo "FAILED: expected 413 or 422, got $STATUS"
    echo "$OVERSIZED_RES"
    exit 1
fi

echo -n "8e. Deleting uploaded plan (DELETE /projects/{id}/plans/{planId})... "
DEL_PLAN_RES=$(do_curl -X DELETE "${BASE_URL}/api/v1/projects/${PROJECT_ID}/plans/${PLAN_ID}" \
    -H "X-XSRF-TOKEN: $(get_xsrf)")
STATUS=$(echo "$DEL_PLAN_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "200" ]; then
    echo "OK (status: 200 Plan deleted)"
else
    echo "FAILED: expected 200, got $STATUS"
    echo "$DEL_PLAN_RES"
    exit 1
fi

# -------------------------------------------------------------
# 9. Delete Project (DELETE /api/v1/projects/{id})
# -------------------------------------------------------------
echo -n "9. Soft deleting project (DELETE /api/v1/projects/{id})... "
DEL_PROJECT_RES=$(do_curl -X DELETE "${BASE_URL}/api/v1/projects/${PROJECT_ID}" \
    -H "X-XSRF-TOKEN: $(get_xsrf)")
STATUS=$(echo "$DEL_PROJECT_RES" | grep -i "^HTTP/" | tail -n 1 | awk '{print $2}')
if [ "$STATUS" = "200" ]; then
    echo "OK (status: 200 Project deleted)"
else
    echo "FAILED: expected 200, got $STATUS"
    echo "$DEL_PROJECT_RES"
    exit 1
fi

echo ""
echo "=== All Smoke Tests PASSED Successfully ==="
rm -f "$COOKIE_JAR"
exit 0
