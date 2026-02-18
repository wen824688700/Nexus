"use client";

import dynamic from "next/dynamic";
import { PageLoader } from "@/components/cyber/PageLoader";

// 懒加载 AgentsPage 组件，只在访问时才加载
const AgentsPage = dynamic(
  () => import("@/components/agents/AgentsPage").then((mod) => ({ default: mod.AgentsPage })),
  {
    loading: () => <PageLoader isLoading={true} />,
    ssr: false, // 禁用服务端渲染，提升首次加载速度
  },
);

export default function Agents() {
  return <AgentsPage />;
}
