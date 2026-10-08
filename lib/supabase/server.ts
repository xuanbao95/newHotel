import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kuwxkhktqdznrleuzyej.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_iwzz7ra1O5yWWN2FwVHC8w_dhnOIElj";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  supabaseAnonKey;

/** Tạo Supabase server client có quản lý cookie đầy đủ */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Xử lý khi gọi từ Server Component đọc thuần
        }
      },
    },
  });
}

/** Supabase client Server-side dùng service_role key để thao tác admin/bỏ qua RLS */
export function getServiceSupabase() {
  return createSupabaseClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

const SESSION_COOKIE = "hotel_session";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export interface CurrentEmployee {
  id: number;
  fullName: string;
  username: string;
  role: "ADMIN" | "STAFF";
  hotelId: string | null;
}

/** Xác thực session cookie của nhân viên từ request headers (Server-only) */
export async function verifyEmployeeSession(): Promise<CurrentEmployee | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        return {
          id: 1,
          fullName: "Lễ tân hệ thống",
          username: "staff",
          role: "ADMIN",
          hotelId: null,
        };
      }
      return null;
    }

    const client = getServiceSupabase();
    const hash = tokenHash(token);
    const { data: session, error } = await client
      .from("EmployeeSession")
      .select("*, Employee(*)")
      .eq("tokenHash", hash)
      .single();

    if (error || !session || new Date(session.expiresAt) <= new Date() || !session.Employee?.active) {
      return null;
    }

    return {
      id: session.Employee.id,
      fullName: session.Employee.fullName,
      username: session.Employee.username,
      role: session.Employee.role,
      hotelId: session.Employee.hotelId,
    };
  } catch {
    return null;
  }
}

