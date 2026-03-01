import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC, ZCOOL_QingKe_HuangYou, Orbitron } from "next/font/google";
import "./globals.css";
import { GridBackground, FloatingParticles } from "@/components/cyber";
import { FloatingMusicPlayer, MusicLightEffect } from "@/components/music";
import { Navbar, Footer, PageTransition, GlobalWindowManager } from "@/components/layout";
import { AgentPreloader } from "@/components/home/AgentPreloader";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { NavbarAuth } from "@/components/auth/NavbarAuth";
import { createClient } from "@/lib/supabase/server";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-sans-var",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono-var", subsets: ["latin"] });
const zcool = ZCOOL_QingKe_HuangYou({
  variable: "--font-display-var",
  subsets: ["latin"],
  weight: "400",
});
const orbitron = Orbitron({
  variable: "--font-orbitron-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "APEX AI | Labs",
  description: "Personal homepage (Bento Grid + Modal + Agents)",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get current user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile if authenticated
  let userProfile: {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    role?: string;
  } | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", user.id)
      .single<{ username: string; avatar_url: string | null; role: string }>();

    if (profile) {
      userProfile = {
        id: user.id,
        email: user.email!,
        username: profile.username || undefined,
        avatar_url: profile.avatar_url || undefined,
        role: profile.role || undefined,
      };
    }
  }

  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSC.variable} ${jetbrainsMono.variable} ${zcool.variable} ${orbitron.variable} antialiased`}
      >
        <AuthProvider>
          <CreditsProvider>
            <QuotaProvider>
              {/* Cyberpunk Background Effects */}
              <GridBackground className="fixed inset-0 z-0" />
              <FloatingParticles className="fixed inset-0 z-0" count={30} />

              {/* Navigation with Auth UI */}
              <Navbar authUI={<NavbarAuth user={userProfile} />} />

              {/* Main Content with Page Transition */}
              <div className="relative z-10">
                <PageTransition>{children}</PageTransition>
              </div>

              {/* Footer */}
              <Footer />

              {/* Music Player and Effects */}
              <MusicLightEffect />
              <FloatingMusicPlayer />

              {/* Global Window Manager - 跨页面持久化窗口 */}
              <GlobalWindowManager />

              {/* Agent Preloader - 预加载智能体组件 */}
              <AgentPreloader />

              {/* Noise Texture */}
              <div className="noise" />
            </QuotaProvider>
          </CreditsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
