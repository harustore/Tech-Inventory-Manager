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
  Box
} from "lucide-react";

export default function Dashboard() {
  const { data: resumen, isLoading } = useGetResumenCapital({
    query: {
      queryKey: getGetResumenCapitalQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Resumen general de tu negocio</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!resumen) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visión general del capital y movimiento de inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-emerald-50 text-sm font-medium">Capital Total</CardTitle>
            <PiggyBank className="w-5 h-5 text-emerald-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(resumen.capitalTotal)}</div>
            <p className="text-xs text-emerald-100 mt-1">Caja + Inventario</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Caja Actual</CardTitle>
            <Wallet className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.cajaActual)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dinero disponible</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="w-5 h-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.valorInventario)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Costo de equipos en stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Ganancias</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Histórica</CardTitle>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.gananciaTotalHistorica)}</div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Este Mes</CardTitle>
                <LineChart className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(resumen.gananciaMes)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Actividad (30 días)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ventas</CardTitle>
                <ShoppingCart className="w-5 h-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.ventasUltimos30Dias}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">equipos vendidos</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium">Compras</CardTitle>
                <Activity className="w-5 h-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.comprasUltimos30Dias}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">equipos comprados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Estado de Equipos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Box className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">En Stock</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.itemsEnStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reservados</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.itemsReservados}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Vendidos Totales</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resumen.itemsVendidos}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
