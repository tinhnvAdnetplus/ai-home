<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Wizard\AnswerResolver;

$casesPath = __DIR__ . '/parity-cases.json';
if (!file_exists($casesPath)) {
    echo "ERROR: parity-cases.json not found\n";
    exit(1);
}

$cases = json_decode((string) file_get_contents($casesPath), true);
if (!is_array($cases)) {
    echo "ERROR: Invalid parity-cases.json\n";
    exit(1);
}

$passed = 0;
$failed = 0;

foreach ($cases as $index => $tc) {
    $name = $tc['name'] ?? "Case #{$index}";
    $wizard = $tc['wizard'];
    $answers = $tc['answers'];
    $expected = $tc['expectedState'];

    $phpState = AnswerResolver::resolveWizardState($wizard, $answers);

    // Deep compare
    $diffs = [];
    foreach (['visible', 'disabled', 'disabledOptions', 'answers', 'missingRequired'] as $key) {
        $expVal = $expected[$key] ?? null;
        $phpVal = $phpState[$key] ?? null;

        $expValJson = json_encode($expVal);
        $phpValJson = json_encode($phpVal);

        if ($expValJson !== $phpValJson) {
            $diffs[] = "Key '{$key}' differs: Expected {$expValJson}, got {$phpValJson}";
        }
    }

    if (empty($diffs)) {
        echo "✓ {$name}: PASS\n";
        $passed++;
    } else {
        echo "✗ {$name}: FAIL\n";
        foreach ($diffs as $d) {
            echo "    {$d}\n";
        }
        $failed++;
    }
}

echo "\nParity Test Summary: {$passed} passed, {$failed} failed.\n";
exit($failed > 0 ? 1 : 0);
