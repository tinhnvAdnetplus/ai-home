<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

final class GenerateReportRequest extends FormRequest
{
    private const ALLOWED_IMAGE_KEYS = [
        'plan1f',
        'plan2f',
        'elevS',
        'elevN',
        'elevE',
        'elevW',
        'view3d',
    ];

    private const MAX_IMAGE_BYTES = 1258291; // 1.2 MB = 1.2 * 1024 * 1024

    private const PNG_HEADER = "\x89PNG\r\n\x1a\n";

    private const JPEG_HEADER = "\xFF\xD8\xFF";

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
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'locale' => ['nullable', 'string', 'in:ja,en,vi'],
            'planLabel' => ['nullable', 'string', 'max:255'],
            'images' => ['nullable', 'array', 'max:7'],
            'commentary' => ['nullable', 'array'],
            'commentary.headline' => ['nullable', 'string', 'max:500'],
            'commentary.body' => ['nullable', 'string', 'max:5000'],
            'commentary.pros' => ['nullable', 'array', 'max:20'],
            'commentary.pros.*' => ['string', 'max:500'],
            'commentary.cautions' => ['nullable', 'array', 'max:20'],
            'commentary.cautions.*' => ['string', 'max:500'],
        ];
    }

    /**
     * Configure the validator instance with custom data URL and image checks.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $images = $this->input('images');
            if (!is_array($images)) {
                return;
            }

            foreach ($images as $key => $value) {
                $field = "images.{$key}";

                if (!is_string($key) || !in_array($key, self::ALLOWED_IMAGE_KEYS, true)) {
                    $v->errors()->add($field, 'Unrecognized image key.');
                    continue;
                }

                if (!is_string($value)) {
                    $v->errors()->add($field, 'Image must be a data URL string.');
                    continue;
                }

                if (!preg_match('/^data:image\/(png|jpeg|jpg);base64,([A-Za-z0-9+\/=_ \r\n-]+)$/', $value, $matches)) {
                    $v->errors()->add($field, 'Image must be a valid PNG or JPEG data URL.');
                    continue;
                }

                $rawBase64 = str_replace(["\r", "\n", ' '], '', $matches[2]);
                $binary = base64_decode($rawBase64, true);

                if ($binary === false) {
                    $v->errors()->add($field, 'Image payload could not be base64-decoded.');
                    continue;
                }

                if (strlen($binary) > self::MAX_IMAGE_BYTES) {
                    $v->errors()->add($field, 'Image exceeds maximum size of 1.2 MB.');
                    continue;
                }

                $isPng = str_starts_with($binary, self::PNG_HEADER);
                $isJpeg = str_starts_with($binary, self::JPEG_HEADER);

                if (!$isPng && !$isJpeg) {
                    $v->errors()->add($field, 'Image binary does not match PNG or JPEG magic bytes.');
                }
            }
        });
    }
}
