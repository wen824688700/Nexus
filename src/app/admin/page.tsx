import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  // 验证用户登录
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // 验证管理员权限
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile as { role: string }).role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">管理后台</h1>
        <AdminDashboard />
      </div>
    </div>
  );
}
