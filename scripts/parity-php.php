<?php

declare(strict_types=1);

require_once __DIR__ . '/../apps/api/vendor/autoload.php';

use App\Config\Wizard\AnswerResolver;

$raw = file_get_contents('php://stdin');
if ($raw === false) {
    exit(1);
}

$input = json_decode($raw, true);
if (!is_array($input) || !isset($input['wizard'], $input['answers'])) {
    exit(1);
}

$state = AnswerResolver::resolveWizardState($input['wizard'], $input['answers']);
echo json_encode($state, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
