import { useGetResumenCapital, getGetResumenCapitalQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  Package,
  TrendingUp,
  PiggyBank,
  LineChart,
  ShoppingCart,
  Activity,
  Box,
} from "lucide-react";

export default function Dashboard() {
  const { data: resumen, isLoading } = useGetResumenCapital({
    query: {
      queryKey: getGetResumenCapitalQueryKey(),
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-5 w-96 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  const heroMetrics = [
    {
      label: "Capital total",
      value: formatCurrency(resumen.capitalTotal),
      note: "Caja + inventario",
      icon: PiggyBank,
      tone: "from-cyan-500 to-cyan-600",
      badge: "Principal",
    },
    {
      label: "Caja actual",
      value: formatCurrency(resumen.cajaActual),
      note: "Disponible ahora",
      icon: Wallet,
      tone: "from-slate-700 to-slate-900",
      badge: "Liquidez",
    },
    {
      label: "Inventario",
      value: formatCurrency(resumen.valorInventario),
      note: "Costo en stock",
      icon: Package,
      tone: "from-sky-500 to-blue-600",
      badge: "Activos",
    },
  ];

  const activity = [
    {
      label: "Ganancia histÃ³rica",
      value: formatCurrency(resumen.gananciaTotalHistorica),
      icon: TrendingUp,
      accent: "text-cyan-500",
    },
    {
      label: "Ganancia del mes",
      value: formatCurrency(resumen.gananciaMes),
      icon: LineChart,
      accent: "text-blue-500",
    },
    {
      label: "Ventas 30 dÃ­as",
      value: String(resumen.ventasUltimos30Dias),
      icon: ShoppingCart,
      accent: "text-cyan-500",
    },
    {
      label: "Compras 30 dÃ­as",
      value: String(resumen.comprasUltimos30Dias),
      icon: Activity,
      accent: "text-amber-500",
    },
  ];

  const statusCards = [
    {
      label: "En stock",
      value: resumen.itemsEnStock,
      icon: Box,
      className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    },
    {
      label: "Reservados",
      value: resumen.itemsReservados,
      icon: Package,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    },
    {
      label: "Vendidos",
      value: resumen.itemsVendidos,
      icon: ShoppingCart,
      className: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white shadow-2xl shadow-slate-950/20 dark:border-slate-700/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
        <div className="relative p-6 md:p-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Resumen operativo
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Controla el negocio sin perder de vista caja, stock y ventas.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-300 md:text-base">
              Una vista compacta para entender el capital total, el flujo del mes y el pulso del inventario.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {heroMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={metric.label}
                  className="border-white/10 bg-white/10 text-white shadow-none backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">{metric.badge}</p>
                      <CardTitle className="mt-2 text-sm font-medium text-white/80">{metric.label}</CardTitle>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${metric.tone} p-2.5 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <div className="text-2xl font-semibold tracking-tight md:text-3xl">{metric.value}</div>
                    <p className="mt-1 text-xs text-white/65">{metric.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Ganancias y actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            {activity.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                    <Icon className={`w-5 h-5 ${item.accent}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Estado de equipos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            {statusCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className={`inline-flex rounded-2xl p-2 ${item.className}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

