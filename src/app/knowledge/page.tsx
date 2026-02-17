"use client";

import dynamic from "next/dynamic";
import { PageLoader } from "@/components/cyber/PageLoader";

// 懒加载 KnowledgePage 组件，只在访问时才加载
const KnowledgePage = dynamic(
  () => import("@/components/knowledge/KnowledgePage").then((mod) => ({ default: mod.KnowledgePage })),
  {
    loading: () => <PageLoader isLoading={true} />,
    ssr: false, // 禁用服务端渲染，提升首次加载速度
  }
);

export default function Knowledge() {
  return <KnowledgePage />;
}
