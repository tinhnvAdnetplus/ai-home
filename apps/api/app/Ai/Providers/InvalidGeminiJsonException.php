<?php

declare(strict_types=1);

namespace App\Ai\Providers;

use RuntimeException;

/** Gemini answered but the body is not the JSON we asked for (truncated / runaway output). */
final class InvalidGeminiJsonException extends RuntimeException
{
}
