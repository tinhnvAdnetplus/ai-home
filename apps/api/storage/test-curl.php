<?php

$ch = curl_init('http://nginx/sanctum/csrf-cookie');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: localhost:8080',
    'Origin: http://localhost:8080',
    'Referer: http://localhost:8080/',
]);
$res = curl_exec($ch);
curl_close($ch);

preg_match('/Set-Cookie:\s*ai-home-session=([^;]+)/i', $res, $mSession);
preg_match('/Set-Cookie:\s*XSRF-TOKEN=([^;]+)/i', $res, $mXsrf);

$session = $mSession[1] ?? '';
$xsrf = $mXsrf[1] ?? '';
$xsrfToken = urldecode($xsrf);

// Login
$ch = curl_init('http://nginx/api/v1/auth/login');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => 'admin@aihome.local',
    'password' => 'Password1234!',
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: localhost:8080',
    'Origin: http://localhost:8080',
    'Referer: http://localhost:8080/',
    'Content-Type: application/json',
    'Accept: application/json',
    'Cookie: ai-home-session=' . $session . '; XSRF-TOKEN=' . $xsrf,
    'X-XSRF-TOKEN: ' . $xsrfToken,
]);
$loginRes = curl_exec($ch);
curl_close($ch);

preg_match('/Set-Cookie:\s*ai-home-session=([^;]+)/i', $loginRes, $mAuthSession);
preg_match('/Set-Cookie:\s*XSRF-TOKEN=([^;]+)/i', $loginRes, $mAuthXsrf);

$authSession = $mAuthSession[1] ?? $session;
$authXsrf = $mAuthXsrf[1] ?? $xsrf;

// Test GET /api/v1/admin/configs/wizard
$ch = curl_init('http://nginx/api/v1/admin/configs/wizard');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: localhost:8080',
    'Origin: http://localhost:8080',
    'Referer: http://localhost:8080/',
    'Accept: application/json',
    'Cookie: ai-home-session=' . $authSession . '; XSRF-TOKEN=' . $authXsrf,
]);
$docRes = curl_exec($ch);
curl_close($ch);
echo "GET /api/v1/admin/configs/wizard:\n" . substr($docRes, 0, 500) . "...\n\n";

// Test GET /api/v1/admin/configs/wizard/versions
$ch = curl_init('http://nginx/api/v1/admin/configs/wizard/versions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: localhost:8080',
    'Origin: http://localhost:8080',
    'Referer: http://localhost:8080/',
    'Accept: application/json',
    'Cookie: ai-home-session=' . $authSession . '; XSRF-TOKEN=' . $authXsrf,
]);
$verRes = curl_exec($ch);
curl_close($ch);
echo "GET /api/v1/admin/configs/wizard/versions:\n" . substr($verRes, 0, 300) . "...\n\n";

// Test GET /api/v1/admin/configs/wizard/audit
$ch = curl_init('http://nginx/api/v1/admin/configs/wizard/audit');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Host: localhost:8080',
    'Origin: http://localhost:8080',
    'Referer: http://localhost:8080/',
    'Accept: application/json',
    'Cookie: ai-home-session=' . $authSession . '; XSRF-TOKEN=' . $authXsrf,
]);
$auditRes = curl_exec($ch);
curl_close($ch);
echo "GET /api/v1/admin/configs/wizard/audit:\n" . substr($auditRes, 0, 300) . "...\n\n";
