export const STEP_ICONS = [
    'home',
    'map-pin',
    'layout-grid',
    'users',
    'image',
    'palette',
    'heart',
    'star',
    'yen',
    'shield',
    'check',
    'map',
    'family',
    'building',
    'sofa',
    'settings',
    'file-text',
] as const;

export type StepIcon = (typeof STEP_ICONS)[number];

export const UPLOAD_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/dxf',
] as const;

export type UploadMimeType = (typeof UPLOAD_MIME_TYPES)[number];

export const MAX_STEPS = 20;
export const MAX_SECTIONS_PER_STEP = 20;
export const MAX_FIELDS_TOTAL = 150;
export const MAX_OPTIONS_PER_FIELD = 60;
