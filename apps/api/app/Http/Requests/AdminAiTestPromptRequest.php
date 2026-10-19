<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

final class AdminAiTestPromptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'which' => ['required', 'string', 'in:constraints,commentary'],
            'prompt' => ['nullable', 'string', 'max:8000'],
            'answers' => ['required', 'array'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $prompt = $this->input('prompt');
            if (is_string($prompt) && preg_match_all('/\{\{([^}]+)\}\}/', $prompt, $matches)) {
                foreach ($matches[1] as $ph) {
                    $trimmed = trim($ph);
                    if ($trimmed !== 'answers' && $trimmed !== 'locale') {
                        $v->errors()->add('prompt', "Unknown placeholder '{{{$trimmed}}}'. Only {{answers}} and {{locale}} are allowed.");
                    }
                }
            }
        });
    }
}
