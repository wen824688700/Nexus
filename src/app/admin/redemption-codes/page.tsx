import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RedemptionCodesAdmin from "@/components/admin/RedemptionCodesAdmin";

export default async function AdminRedemptionCodesPage() {
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">兑换码管理</h1>
        <RedemptionCodesAdmin />
      </div>
    </div>
  );
}
