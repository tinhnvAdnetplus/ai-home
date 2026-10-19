<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('email') && is_string($this->input('email'))) {
            $this->merge([
                'email' => strtolower(trim($this->input('email'))),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'min:10',
                'confirmed',
                function (string $attribute, mixed $value, Closure $fail): void {
                    // bcrypt only uses the first 72 BYTES and silently ignores the rest, so refuse longer passwords
                    if (is_string($value) && strlen($value) > 72) {
                        $fail('The password may not be longer than 72 bytes.');
                    }
                },
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (is_string($value) && is_string($this->input('email'))) {
                        if (strtolower(trim($value)) === strtolower(trim($this->input('email')))) {
                            $fail('The password cannot be the same as your email address.');
                        }
                    }
                },
            ],
            'password_confirmation' => ['required', 'string'],
        ];
    }
}
