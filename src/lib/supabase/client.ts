import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

/**
 * Creates a Supabase client for use in Client Components
 *
 * This client is designed for browser-side operations and should only be used
 * in components marked with 'use client' directive.
 *
 * @returns A configured Supabase browser client instance
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client for browser-side operations
 * }
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
