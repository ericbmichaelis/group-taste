import { useEffect } from "react";
import { Flame, Users, Crown, ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { SignInButton } from "@alien_org/sso-sdk-react";
import { useAppStore } from "./lib/store";
import { useAlienAuth } from "./hooks/useAlienAuth";
import { useXmtp } from "./hooks/useXmtp";
import { MarketsTab } from "./components/MarketsTab";
import { LeaderboardTab } from "./components/LeaderboardTab";
import { GroupsTab } from "./components/GroupsTab";

function App() {
  const { activeTab, setActiveTab, setDeepLinkBetId } = useAppStore();
  const { isAuthenticated, user, signOut } = useAlienAuth();
  const { isConnected: xmtpConnected, isConnecting: xmtpConnecting } = useXmtp();

  // Handle ?bet=ID deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const betId = params.get("bet");
    if (betId) {
      setDeepLinkBetId(betId);
      setActiveTab("groups");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [setDeepLinkBetId, setActiveTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              Group Taste
            </span>
            <span className="text-lg">👅</span>
            <span className="text-[10px] font-medium bg-white/20 text-white px-1.5 py-0.5 rounded-full">
              BETA
            </span>
            {xmtpConnecting ? (
              <span className="flex items-center gap-1 text-[10px] text-white/60 px-1.5 py-0.5">
                <Loader2 size={8} className="animate-spin" /> XMTP
              </span>
            ) : xmtpConnected ? (
              <span className="flex items-center gap-1 text-[10px] text-green-300 bg-green-500/20 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> XMTP
              </span>
            ) : null}
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-none">
                  {user.name}
                </p>
                {user.verified && (
                  <p className="flex items-center gap-0.5 text-[10px] text-green-300 font-medium mt-0.5 justify-end">
                    <ShieldCheck size={10} />
                    Real one
                  </p>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <button
                onClick={signOut}
                className="p-1.5 rounded-lg hover:bg-white/20 transition"
                title="Sign out"
              >
                <LogOut size={14} className="text-white/70" />
              </button>
            </div>
          ) : (
            <SignInButton variant="short" color="dark" />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {activeTab === "markets" && <MarketsTab />}
        {activeTab === "groups" && <GroupsTab />}
        {activeTab === "leaderboard" && <LeaderboardTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe">
        <div className="max-w-2xl mx-auto flex">
          {[
            { tab: "markets" as const, icon: Flame, label: "Markets", activeColor: "text-purple-600" },
            { tab: "groups" as const, icon: Users, label: "Squad", activeColor: "text-pink-500" },
            { tab: "leaderboard" as const, icon: Crown, label: "Hall of Fame", activeColor: "text-yellow-500" },
          ].map(({ tab, icon: Icon, label, activeColor }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                activeTab === tab ? activeColor : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              {label}
              {activeTab === tab && (
                <span className={`absolute top-0 w-8 h-0.5 rounded-full ${
                  tab === "leaderboard" ? "bg-yellow-500" : tab === "groups" ? "bg-pink-500" : "bg-purple-600"
                }`} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default App;
