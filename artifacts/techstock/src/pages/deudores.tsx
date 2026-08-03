import { useGetDeudores } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { HandCoins, Users, CalendarClock, Phone, IdCard, ChevronRight, PartyPopper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Deudores() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error, refetch } = useGetDeudores();

  const totalCuotasPendientes = (data?.deudores ?? []).reduce(
    (sum, d) => sum + d.cuotasPendientes,
    0,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Deudores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ventas en cuotas con saldo pendiente</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Deudores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ventas en cuotas con saldo pendiente</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          <h3 className="text-lg font-semibold">No pudimos cargar los deudores</h3>
          <p className="mt-2 text-sm text-red-800 dark:text-red-200">
            La API devolvió un error al consultar las cuotas pendientes. Probá de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (data.deudores.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Deudores</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Ventas en cuotas con saldo pendiente</p>
        </div>
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
          <PartyPopper className="mx-auto h-12 w-12 text-emerald-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Sin deudas pendientes</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Todas las ventas en cuotas están al día. ¡Buen trabajo!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Deudores</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Cuotas pendientes por cobrar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-red-100 shadow-sm bg-gradient-to-br from-red-500 to-rose-600 text-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-red-50 text-sm font-medium">Total por cobrar</p>
              <HandCoins className="w-5 h-5 text-red-100" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(data.totalDeuda)}</p>
            <p className="text-xs text-red-100 mt-1">suma de saldos pendientes</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Deudores</p>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{data.cantidadDeudores}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">compras con saldo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cuotas pendientes</p>
              <CalendarClock className="w-5 h-5 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCuotasPendientes}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">en total</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="hidden md:grid grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="px-5 py-4">
                  <div className="md:hidden flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {d.buyerName || "Sin nombre"}
                    </span>
                    <span className="font-bold text-red-600">{formatCurrency(d.saldoPendiente)}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1.4fr_0.8fr_1fr_1fr_1fr_1fr] gap-3 md:gap-4 items-start md:items-center">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
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
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                        {d.marca} {d.modelo}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{d.equipo}</p>
                    </div>

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {d.fechaVenta ? formatDate(d.fechaVenta) : "—"}
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
                      d.saldoPendiente > 0 ? "text-red-600" : "text-emerald-600",
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
