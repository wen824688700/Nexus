"use client";

import { useState } from "react";
import { Ticket, Gift, MessageSquare } from "lucide-react";
import InviteCodeManager from "./InviteCodeManager";
import RedemptionCodesAdmin from "./RedemptionCodesAdmin";
import FeedbackAdmin from "./FeedbackAdmin";

type TabType = "invite-codes" | "redemption-codes" | "feedbacks";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("invite-codes");

  const tabs = [
    {
      id: "invite-codes" as TabType,
      label: "邀请码管理",
      icon: Ticket,
      description: "管理用户注册邀请码",
    },
    {
      id: "redemption-codes" as TabType,
      label: "兑换码管理",
      icon: Gift,
      description: "管理积分兑换码",
    },
    {
      id: "feedbacks" as TabType,
      label: "用户反馈",
      icon: MessageSquare,
      description: "查看用户反馈和建议",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="flex gap-4 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              <Icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{tab.label}</div>
                <div className="text-xs text-white/40">{tab.description}</div>
              </div>

              {/* 激活指示器 */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="rounded-lg border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        {activeTab === "invite-codes" && <InviteCodeManager />}
        {activeTab === "redemption-codes" && <RedemptionCodesAdmin />}
        {activeTab === "feedbacks" && <FeedbackAdmin />}
      </div>
    </div>
  );
}
