<?php

declare(strict_types=1);

namespace App\Config\Wizard;

/**
 * State tracker for recursive condition AST evaluation.
 */
final class ConditionEvalState
{
    public int $nodeCount = 0;

    public bool $hasExceededLimits = false;
}
