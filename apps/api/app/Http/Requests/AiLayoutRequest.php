<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AiLayoutRequest extends FormRequest
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
            'context.variant' => ['required', 'array'],
            'context.lot' => ['required', 'array'],
            'context.floors' => ['required', 'integer', 'in:1,2'],
            'issues' => ['nullable', 'array', 'max:20'],
            'issues.*' => ['string', 'max:400'],
            'previousLayout' => ['nullable', 'array'],
        ];
    }
}
