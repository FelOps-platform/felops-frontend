import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const fileSourceSchema = z.object({
  sourceType: z.literal('file'),
  file: z
    .custom<File>(
      (val) => typeof window !== 'undefined' && val instanceof File,
      'File is required'
    )
    .refine(
      (f) =>
        ALLOWED_MIME_TYPES.includes(f.type as (typeof ALLOWED_MIME_TYPES)[number]),
      'Supported file types: PDF, DOCX, TXT'
    )
    .refine((f) => f.size <= MAX_FILE_SIZE, 'File size must not exceed 10MB'),
  name: z
    .string()
    .trim()
    .min(1, 'Source name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer')
    .optional(),
});

const websiteSourceSchema = z.object({
  sourceType: z.literal('website'),
  url: z
    .string()
    .trim()
    .min(1, 'Website URL is required')
    .transform(normalizeUrl)
    .pipe(
      z.string().url('Please enter a valid website URL (e.g. https://example.com)')
    ),
  name: z
    .string()
    .trim()
    .min(1, 'Source name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or fewer')
    .optional(),
});

export const addKnowledgeSchema = z.discriminatedUnion('sourceType', [
  fileSourceSchema,
  websiteSourceSchema,
]);

export type AddKnowledgeFormData = z.infer<typeof addKnowledgeSchema>;
