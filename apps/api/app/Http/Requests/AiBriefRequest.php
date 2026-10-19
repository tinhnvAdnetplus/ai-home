<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AiBriefRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'context' => ['required', 'array'],
            'context.lot' => ['required', 'array'],
            'context.program' => ['required', 'array'],
            'context.feasibility' => ['required', 'array'],
            'context.allowedChanges' => ['required', 'array'],
            'issues' => ['nullable', 'array', 'max:20'],
            'issues.*' => ['string', 'max:400'],
            'previousAnswer' => ['nullable', 'array'],
        ];
    }
}
