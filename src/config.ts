import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  TESTRAIL_URL: z
    .string()
    .url()
    .transform((u) => (u.endsWith('/') ? u.slice(0, -1) : u)),
  TESTRAIL_USERNAME: z.string().min(1),
  TESTRAIL_API_KEY: z.string().min(1),
  TESTRAIL_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10000))
    .pipe(z.number().int().positive()),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export const config: AppConfig = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
})();


