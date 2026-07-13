import { useGetRecomendaciones, getGetRecomendacionesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Lightbulb, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Recomendaciones() {
  const { data: recomendaciones, isLoading } = useGetRecomendaciones({
    query: {
      queryKey: getGetRecomendacionesQueryKey()
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recomendaciones</h1>
        <p className="text-slate-500 mt-1">Análisis inteligente basado en tu historial de ventas</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start">
        <div className="bg-emerald-100 rounded-full p-2 shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-900">¿Cómo funciona?</h3>
          <p className="text-sm text-emerald-800/80 mt-1">
            El sistema analiza todos los equipos que has vendido, calcula márgenes promedio y velocidad de venta por modelo, 
            para sugerirte en qué invertir tu capital actual para maximizar ganancias.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : recomendaciones?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Necesitamos más datos</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Registra más ventas para que el sistema pueda analizar patrones y ofrecerte recomendaciones precisas de inversión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recomendaciones?.map((rec, index) => (
            <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                      {rec.categoria}
                    </CardDescription>
                    <CardTitle className="text-xl">{rec.marca} {rec.modelo}</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {rec.unidadesVendidas} vendidos
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Precio Sugerido de Compra</span>
                    <span className="font-bold text-slate-900">{formatCurrency(rec.precioCompraRecomendado)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                    <span className="text-slate-500">Precio Promedio de Venta</span>
                    <span className="font-medium text-slate-900">{formatCurrency(rec.avgPrecioVenta)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-3">
                    <span className="text-slate-500">Ganancia Estimada</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(rec.avgGananciaNeta)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-start gap-3 text-sm text-slate-700 bg-white border border-slate-100 p-4 rounded-lg shadow-sm">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{rec.recomendacion}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
