import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  Package,
  Users,
  Wallet,
  Lightbulb,
  HandCoins,
  LogOut,
  Menu,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/proveedores", label: "Contactos de Compra", icon: Users },
  { href: "/movimientos-caja", label: "Caja", icon: Wallet },
  { href: "/recomendaciones", label: "Recomendaciones", icon: Lightbulb },
  { href: "/deudores", label: "Deudores", icon: HandCoins },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-cyan-500/10 bg-slate-950 text-slate-300 shadow-2xl shadow-slate-950/30 transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-18 shrink-0 items-center gap-3 border-b border-white/5 bg-gradient-to-b from-slate-900 to-slate-950 px-6 text-white">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md" />
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Logo" className="relative h-9 w-9" />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">TechStock</span>
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400">HARUSTORE INV</span>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]"
                    : "border-transparent hover:border-white/5 hover:bg-white/5 hover:text-slate-50",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-150 hover:border-white/5 hover:bg-white/5 hover:text-slate-100"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>

        <div className="shrink-0 border-t border-white/5 bg-slate-950 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 font-bold text-white shadow-lg shadow-cyan-500/20">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-100">{user?.fullName || "Usuario"}</p>
              <p className="truncate text-xs text-slate-400">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-150 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-950/90 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">TechStock</span>
          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <nav
          aria-label="Navegación principal móvil"
          className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 md:hidden"
        >
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300"
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label === "Contactos de Compra" ? "Contactos" : item.label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="relative flex-1 overflow-auto p-3 pb-24 sm:p-4 md:p-8 md:pb-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_30%)]" />
          <div className="relative mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

