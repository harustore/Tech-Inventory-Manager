import { useGetRecomendaciones, getGetRecomendacionesQueryKey } from "@workspace/api-client-react";
import { customFetch } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Lightbulb, TrendingUp, AlertCircle, Sparkles, Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const fuentesMercado = [
  ["Celulares usados", "https://listado.mercadolibre.cl/celulares-telefonia/celulares-smartphones/usado/celular_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["Celulares 256 GB o más", "https://listado.mercadolibre.cl/celulares-telefonia/celulares-smartphones/usado/celular_OrderId_PRICE_PublishedToday_YES_INTERNAL*MEMORY_256GB-*_NoIndex_True"],
  ["Tablets usadas", "https://listado.mercadolibre.cl/computacion/tablets-accesorios/tablets/usado/tablets_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["Notebooks usadas", "https://listado.mercadolibre.cl/computacion/notebooks-accesorios/notebooks/usado/notebooks_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["Consolas usadas", "https://listado.mercadolibre.cl/consolas-videojuegos/consolas/usado/_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["Smartwatches usados", "https://listado.mercadolibre.cl/celulares-telefonia/smartwatches-accesoriossmartwatch/usado/_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["Audífonos usados", "https://listado.mercadolibre.cl/electronica-audio-video/audio/audifonos/usado/_PublishedToday_YES"],
  ["RTX y GTX usadas", "https://listado.mercadolibre.cl/rtx_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True"],
  ["Televisores usados", "https://listado.mercadolibre.cl/electronica-audio-video/televisores/usado/televisores_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
  ["TV Box usados", "https://listado.mercadolibre.cl/tv-box_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True"],
  ["Apple usado", "https://listado.mercadolibre.cl/apple_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True"],
  ["Paletas y raquetas usadas", "https://listado.mercadolibre.cl/deportes-fitness/tenis-padel-squash/equipamiento/paletas-raquetas/tenis-squash/usado/_OrderId_PRICE_PublishedToday_YES_NoIndex_True"],
] as const;

export default function Recomendaciones() {
  const { data: recomendaciones, isLoading } = useGetRecomendaciones({
    query: {
      queryKey: getGetRecomendacionesQueryKey()
    }
  });
  const { data: radar, isLoading: isRadarLoading } = useQuery({
    queryKey: ["mercadolibre-radar"],
    queryFn: () => customFetch<{ currency: string; collectedAt: string; sources: Array<{ name: string; status: string; listings: number; averagePrice: number; minPrice: number; maxPrice: number }> }>("/api/analytics/mercadolibre-radar", { responseType: "json" }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Recomendaciones</h1>
        <a href="http://localhost:3000/api/mercadolibre/connect" className="mt-4 inline-flex items-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700">
          <Link2 className="mr-2 h-4 w-4" /> Conectar MercadoLibre
        </a>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Análisis inteligente basado en tu historial de ventas</p>
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

      <Card className="border-cyan-200 bg-cyan-50/70 dark:border-cyan-900 dark:bg-cyan-950/20">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-slate-100">Radar de mercado usado</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Fuentes de MercadoLibre Chile que usaremos para comparar publicaciones nuevas y precios en CLP.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fuentesMercado.map(([nombre, url]) => (
            <a key={nombre} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm font-medium text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-cyan-900 dark:bg-slate-900 dark:text-cyan-300 dark:hover:bg-cyan-950/50">
              {nombre}
            </a>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-slate-100">Precios publicados hoy</CardTitle>
          <CardDescription className="dark:text-slate-400">Lectura automática de publicaciones usadas en MercadoLibre Chile.</CardDescription>
        </CardHeader>
        <CardContent>
          {isRadarLoading ? <Skeleton className="h-32 w-full" /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {radar?.sources.map((source) => (
                <div key={source.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{source.name}</p>
                    <span className={source.status === "ok" ? "text-xs text-emerald-600" : "text-xs text-amber-600"}>{source.status === "ok" ? "Actualizado" : "No disponible"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Publicaciones detectadas: {source.listings}</p>
                  <p className="mt-1 text-lg font-bold text-cyan-700 dark:text-cyan-300">{source.averagePrice ? formatCurrency(source.averagePrice) : "Sin datos"}</p>
                  {source.minPrice > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Rango: {formatCurrency(source.minPrice)} – {formatCurrency(source.maxPrice)}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : recomendaciones?.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Necesitamos más datos</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Registra más ventas para que el sistema pueda analizar patrones y ofrecerte recomendaciones precisas de inversión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recomendaciones?.map((rec, index) => (
            <Card key={index} className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                      {rec.categoria}
                    </CardDescription>
                    <CardTitle className="text-xl">{rec.marca} {rec.modelo}</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {rec.unidadesVendidas} vendidos
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Precio Sugerido de Compra</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(rec.precioCompraRecomendado)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="text-slate-500 dark:text-slate-400">Precio Promedio de Venta</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(rec.avgPrecioVenta)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                    <span className="text-slate-500 dark:text-slate-400">Ganancia Estimada</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(rec.avgGananciaNeta)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-lg shadow-sm">
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
