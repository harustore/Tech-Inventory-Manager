import { useGetDeudores } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { HandCoins, Users, CalendarClock, Phone, IdCard, ChevronRight, PartyPopper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function PageShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 shadow-sm">
      <div className="p-6 md:p-8">
        <p className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
          Deudores
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">{subtitle}</p>
      </div>
    </section>
  );
}

export default function Deudores() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch } = useGetDeudores();

  const totalCuotasPendientes = (data?.deudores ?? []).reduce((sum, d) => sum + d.cuotasPendientes, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageShell
          title="Cuotas pendientes por cobrar"
          subtitle="Esta vista agrupa todas las ventas que todavÃ­a tienen cuotas por cobrar y te deja entrar directo al detalle de cada equipo."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageShell
          title="Cuotas pendientes por cobrar"
          subtitle="Esta vista agrupa todas las ventas que todavÃ­a tienen cuotas por cobrar y te deja entrar directo al detalle de cada equipo."
        />
        <div className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 text-red-900 shadow-sm dark:border-red-900/40 dark:from-red-950/40 dark:to-slate-950 dark:text-red-100">
          <h3 className="text-lg font-semibold">No pudimos cargar los deudores</h3>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            La API devolviÃ³ un error al consultar las cuotas pendientes. ProbÃ¡ de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (data.deudores.length === 0) {
    return (
      <div className="space-y-6">
        <PageShell
          title="Cuotas pendientes por cobrar"
          subtitle="Esta vista agrupa todas las ventas que todavÃ­a tienen cuotas por cobrar y te deja entrar directo al detalle de cada equipo."
        />
        <div className="rounded-3xl border border-dashed border-cyan-200 bg-white p-8 text-center shadow-sm dark:border-cyan-900 dark:bg-slate-950">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300">
            <PartyPopper className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Sin deudas pendientes</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Todas las ventas en cuotas estÃ¡n al dÃ­a. Â¡Buen trabajo!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageShell
        title="Cuotas pendientes por cobrar"
        subtitle="Esta vista agrupa todas las ventas que todavÃ­a tienen cuotas por cobrar y te deja entrar directo al detalle de cada equipo."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden border-red-100 bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-red-50">Total por cobrar</p>
              <HandCoins className="w-5 h-5 text-red-100" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totalDeuda)}</p>
            <p className="mt-1 text-xs text-red-100">suma de saldos pendientes</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Deudores</p>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{data.cantidadDeudores}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">compras con saldo</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Cuotas pendientes</p>
              <CalendarClock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCuotasPendientes}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">en total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-400">
            <span>Comprador</span>
            <span>Equipo</span>
            <span>Venta</span>
            <span>Cuotas</span>
            <span>Total</span>
            <span>Pagado</span>
            <span className="text-right">Saldo pendiente</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.deudores.map((d) => (
              <div
                key={d.equipoId}
                onClick={() => setLocation(`/inventario/${d.equipoId}`)}
                className="cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
              >
                <div className="px-5 py-4">
                  <div className="md:hidden flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-950 dark:text-slate-100">
                      {d.buyerName || "Sin nombre"}
                    </span>
                    <span className="font-bold text-red-600">{formatCurrency(d.saldoPendiente)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1fr_1fr_1fr] gap-3 md:gap-4 items-start md:items-center">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-slate-100 truncate">
                        {d.buyerName || "Sin nombre"}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {d.buyerContact && (
                          <span className="flex items-center gap-1 truncate">
                            <Phone className="w-3 h-3 shrink-0" /> {d.buyerContact}
                          </span>
                        )}
                        {d.buyerRut && (
                          <span className="flex items-center gap-1 truncate">
                            <IdCard className="w-3 h-3 shrink-0" /> {d.buyerRut}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-slate-950 dark:text-slate-100 text-sm truncate">
                        {d.marca} {d.modelo}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{d.equipo}</p>
                    </div>

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {d.fechaVenta ? formatDate(d.fechaVenta) : "â€”"}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {d.ventaCuotasPagadas}/{d.ventaNumeroCuotas}
                      </span>
                      {d.cuotasPendientes > 0 && (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          {d.cuotasPendientes} pend.
                        </span>
                      )}
                    </div>

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(d.precioVenta)}
                    </span>

                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatCurrency(d.totalPagado)}
                    </span>

                    <span className={cn(
                      "text-sm font-bold md:text-right flex items-center gap-1 md:justify-end",
                      d.saldoPendiente > 0 ? "text-red-600" : "text-cyan-600",
                    )}>
                      {formatCurrency(d.saldoPendiente)}
                      <ChevronRight className="w-4 h-4 text-slate-300 hidden md:inline" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

