import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  Package,
  Users,
  Wallet,
  Lightbulb,
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
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center h-16 px-6 bg-slate-950 text-white gap-3 shrink-0">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/logo.svg`} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-tight">TechStock</span>
        </div>

        <div className="flex-1 py-6 px-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>

        <div className="p-4 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold shrink-0">
              {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.fullName || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 md:hidden shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="mr-2">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">TechStock</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
