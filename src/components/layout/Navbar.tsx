"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlitchText } from "@/components/cyber";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/components/auth/AuthProvider";

interface NavbarProps {
  authUI?: React.ReactNode;
}

export function Navbar({ authUI }: NavbarProps) {
  const isAgentModalOpen = useAppStore((state) => state.isAgentModalOpen);
  const isAgentModalFullscreen = useAppStore((state) => state.isAgentModalFullscreen);
  const isKnowledgeFullscreen = useAppStore((state) => state.isKnowledgeFullscreen);
  const { user } = useAuth();
  const pathname = usePathname();

  // 只在首页隐藏导航链接
  const isHomePage = pathname === "/";

  return (
    <nav
      className={`bg-cyber-dark/80 fixed top-0 right-0 left-0 border-b border-white/10 backdrop-blur-lg transition-all duration-300 ${
        isAgentModalFullscreen || isKnowledgeFullscreen
          ? "pointer-events-none -translate-y-full opacity-0"
          : isAgentModalOpen
            ? "z-40"
            : "z-50"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between pr-2 pl-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="APEX AI Logo" className="h-10 w-10 object-contain" />
          <GlitchText as="span" className="font-orbitron text-xl font-bold">
            APEX AI Labs
          </GlitchText>
        </Link>

        {/* Navigation Links - Show on all pages except home */}
        <div className="flex items-center gap-6">
          {user && !isHomePage && (
            <>
              <NavLink href="/agents" color="cyan">
                智能体中心
              </NavLink>
              <NavLink href="/knowledge" color="cyan">
                知识库
              </NavLink>
            </>
          )}

          {/* Authentication UI */}
          {authUI}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  color?: "cyan" | "purple";
}

function NavLink({ href, children, color = "cyan" }: NavLinkProps) {
  const gradientColors = {
    cyan: "from-transparent via-cyber-cyan to-transparent",
    purple: "from-transparent via-purple-400 to-transparent",
  };

  const textColors = {
    cyan: "group-hover:text-cyber-cyan",
    purple: "group-hover:text-purple-400",
  };

  return (
    <Link href={href} className="group relative">
      {/* Container with padding */}
      <div className="relative px-5 py-2.5">
        {/* Static border */}
        <div className="absolute inset-0 rounded-lg border border-white/10 transition-colors duration-300 group-hover:border-white/20" />

        {/* Animated gradient border */}
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${gradientColors[color]} animate-border-spin bg-[length:200%_100%]`}
          style={{
            padding: "2px",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* Text */}
        <span
          className={`relative z-10 block text-sm font-medium tracking-wide text-white/70 ${textColors[color]} transition-colors duration-300`}
        >
          {children}
        </span>
      </div>
    </Link>
  );
}
