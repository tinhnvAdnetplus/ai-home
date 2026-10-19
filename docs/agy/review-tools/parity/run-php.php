<?php
require '/var/www/html/vendor/autoload.php';
$dir = '/var/www/html/storage/tmp-mut';
$files = glob($dir.'/*.json'); sort($files);
$out = [];
foreach ($files as $f) {
    $raw = file_get_contents($f);
    $t = microtime(true);
    $r = \App\Config\Wizard\WizardConfigValidator::validateJson($raw);
    $a = $r->toArray();
    $codes = [];
    foreach (($a['issues'] ?? []) as $i) { $codes[] = is_array($i) ? ($i['code'] ?? '?') : '?'; }
    $codes = array_values(array_unique($codes)); sort($codes);
    $out[basename($f)] = ['ok' => (bool) ($a['ok'] ?? false), 'codes' => $codes, 'ms' => round((microtime(true)-$t)*1000, 1)];
}
file_put_contents($dir.'/php-result.txt', json_encode($out, JSON_UNESCAPED_UNICODE));
echo count($out), " files validated by PHP\n";
