<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class AiCommentaryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'answers' => ['nullable', 'array'],
            'constraints' => ['nullable', 'array'],
            'plans' => ['required', 'array', 'min:1', 'max:3'],
            'plans.*.label' => ['required', 'string', 'max:10'],
            'plans.*.score' => ['required', 'array'],
            'plans.*.score.total' => ['required', 'numeric'],
            'plans.*.summary' => ['required', 'array'],
            'plans.*.warnings' => ['nullable', 'array'],
        ];
    }
}
