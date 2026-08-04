import { useGetResumenCapital, getGetResumenCapitalQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListEquipos, useListProveedores, useListMovimientosCaja, useGetDeudores } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, downloadJson } from "@/lib/utils";
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
  Plus,
  HandCoins,
  Download,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { data: resumen, isLoading, error, refetch } = useGetResumenCapital({
    query: {
      queryKey: getGetResumenCapitalQueryKey(),
    },
  });
  const { data: equipos } = useListEquipos({});
  const { data: proveedores } = useListProveedores();
  const { data: movimientos } = useListMovimientosCaja();
  const { data: deudores } = useGetDeudores();

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

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h2 className="font-semibold">No pudimos cargar el resumen</h2>
            <p className="mt-1 text-sm text-red-800 dark:text-red-200">Revisa tu conexión y vuelve a intentarlo.</p>
            <Button type="button" variant="outline" className="mt-4 border-red-300 dark:border-red-800" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!resumen) return null;
  const capitalCalculado = resumen.cajaActual + resumen.valorInventario;
  const capitalInconsistente = Math.abs(resumen.capitalTotal - capitalCalculado) > 1;
  const equiposVendidos = (equipos ?? []).filter((equipo) => equipo.estado === "vendido");
  const ventasTotales = equiposVendidos.reduce((sum, equipo) => sum + Number(equipo.precioVenta ?? 0), 0);
  const margenHistorico = ventasTotales > 0
    ? (resumen.gananciaTotalHistorica / ventasTotales) * 100
    : 0;

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
      label: "Ganancia histórica",
      value: formatCurrency(resumen.gananciaTotalHistorica),
      icon: TrendingUp,
      accent: "text-cyan-500",
    },
    {
      label: "Ganancia últimos 30 días",
      value: formatCurrency(resumen.gananciaMes),
      icon: LineChart,
      accent: "text-blue-500",
    },
    {
      label: "Ventas 30 días",
      value: String(resumen.ventasUltimos30Dias),
      icon: ShoppingCart,
      accent: "text-cyan-500",
    },
    {
      label: "Compras 30 días",
      value: String(resumen.comprasUltimos30Dias),
      icon: Activity,
      accent: "text-amber-500",
    },
    {
      label: "Cuentas por cobrar",
      value: formatCurrency(deudores?.totalDeuda ?? 0),
      icon: HandCoins,
      accent: "text-red-500",
    },
    {
      label: "Margen histórico",
      value: `${margenHistorico.toFixed(1)}%`,
      icon: TrendingUp,
      accent: "text-emerald-500",
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

  const statusChart = [
    { name: "En stock", value: resumen.itemsEnStock, color: "#2563eb" },
    { name: "Reservados", value: resumen.itemsReservados, color: "#f59e0b" },
    { name: "Vendidos", value: resumen.itemsVendidos, color: "#06b6d4" },
  ];
  const activityChart = [
    { name: "Ganancia", value: resumen.gananciaMes },
    { name: "Caja", value: resumen.cajaActual },
    { name: "Inventario", value: resumen.valorInventario },
  ];
  const descargarRespaldo = () => downloadJson(`techstock-respaldo-${new Date().toISOString().slice(0, 10)}.json`, {
    exportadoEn: new Date().toISOString(),
    resumen,
    equipos: equipos ?? [],
    proveedores: proveedores ?? [],
    movimientosCaja: movimientos ?? [],
    deudores: deudores ?? null,
  });

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
            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
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

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/inventario/nuevo"
              className="inline-flex items-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar compra
            </Link>
            <Link
              href="/deudores"
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <HandCoins className="mr-2 h-4 w-4" />
              Revisar cuotas
            </Link>
            <button
              type="button"
              onClick={descargarRespaldo}
              disabled={!equipos || !proveedores || !movimientos}
              className="inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar respaldo
            </button>
          </div>
        </div>
      </section>

      {(capitalInconsistente || resumen.cajaActual < 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold">Revisa los datos financieros</p>
            <p className="mt-1 text-amber-800 dark:text-amber-200">
              {capitalInconsistente ? "El capital total no coincide con caja más inventario. " : "La caja actual está en negativo. "}
              Verifica los movimientos de caja y las compras registradas.
            </p>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">Distribución del inventario</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {statusChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", color: "hsl(var(--popover-foreground))" }} formatter={(value) => [value, "Equipos"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-slate-100">Capital por componente</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityChart} layout="vertical" margin={{ left: 12, right: 12 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", borderColor: "hsl(var(--border))", color: "hsl(var(--popover-foreground))" }} formatter={(value) => [formatCurrency(Number(value)), "Monto"]} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

