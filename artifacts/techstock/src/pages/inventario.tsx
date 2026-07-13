import { useState } from "react";
import { useListEquipos, getListEquiposQueryKey, EstadoEquipo } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Search, Plus, Filter, Smartphone, Laptop, Tv, Headphones, Watch, Camera, PackageSearch, Battery } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Inventario() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoEquipo | "todos">("en_stock");
  
  const equiposParams = { search: search || undefined, estado: estadoFilter === "todos" ? undefined : estadoFilter };
  const { data: equipos, isLoading } = useListEquipos(equiposParams, {
    query: {
      queryKey: getListEquiposQueryKey(equiposParams)
    }
  });

  const getCategoryIcon = (categoria: string) => {
    switch(categoria) {
      case "Celular": return <Smartphone className="w-5 h-5 text-blue-500" />;
      case "Notebook": 
      case "PC Escritorio": return <Laptop className="w-5 h-5 text-indigo-500" />;
      case "TV": 
      case "TV Box": return <Tv className="w-5 h-5 text-purple-500" />;
      case "Audifonos": return <Headphones className="w-5 h-5 text-rose-500" />;
      case "Smartwatch": return <Watch className="w-5 h-5 text-amber-500" />;
      case "Camara": 
      case "Lentes": return <Camera className="w-5 h-5 text-emerald-500" />;
      default: return <PackageSearch className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEstadoBadge = (estado: EstadoEquipo) => {
    switch(estado) {
      case "en_stock": 
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">En Stock</span>;
      case "reservado":
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Reservado</span>;
      case "vendido":
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Vendido</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Inventario</h1>
          <p className="text-slate-500 mt-1">Gestiona tus equipos y registra ventas</p>
        </div>
        <Link href="/inventario/nuevo" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600 h-10 px-4 py-2 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Registrar Compra
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por equipo, marca, modelo o IMEI..." 
            className="pl-9 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={estadoFilter} onValueChange={(val) => setEstadoFilter(val as any)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="en_stock">En Stock</SelectItem>
              <SelectItem value="reservado">Reservado</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : equipos?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No hay equipos</h3>
          <p className="mt-1 text-sm text-slate-500">No se encontraron equipos con los filtros actuales.</p>
          {search || estadoFilter !== "todos" ? (
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setEstadoFilter("todos"); }}>
              Limpiar filtros
            </Button>
          ) : (
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setLocation("/inventario/nuevo")}>
              Registrar primer equipo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {equipos?.map((equipo, index) => (
            <Card 
              key={equipo.id} 
              className={cn(
                "hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-2",
                `duration-${Math.min(index * 100 + 300, 700)}`,
                equipo.estado === 'vendido' && "opacity-75 bg-slate-50/50"
              )}
              onClick={() => setLocation(`/inventario/${equipo.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-5 gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                    {getCategoryIcon(equipo.categoria)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-base truncate">{equipo.equipo}</h3>
                      {getEstadoBadge(equipo.estado)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{equipo.marca} {equipo.modelo}</span>
                      <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-300"></span>{equipo.estadoEquipoCondicion}</span>
                      {equipo.bateriaPct !== null && equipo.bateriaPct !== undefined && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="w-1 h-1 rounded-full bg-slate-300 mr-0.5"></span>
                          <Battery className="w-3.5 h-3.5" />
                          {equipo.bateriaPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0">
                    <div className="flex justify-between sm:flex-col w-full sm:w-auto">
                      <span className="text-xs text-slate-500 sm:hidden">Costo Total</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(equipo.costoTotal)}</span>
                    </div>
                    {equipo.estado === 'vendido' && equipo.precioVenta && (
                      <div className="flex justify-between sm:flex-col w-full sm:w-auto">
                        <span className="text-xs text-emerald-600 sm:hidden">Vendido en</span>
                        <span className="text-sm font-medium text-emerald-600 sm:text-right">{formatCurrency(equipo.precioVenta)}</span>
                      </div>
                    )}
                    {equipo.estado !== 'vendido' && (
                      <span className="text-xs text-slate-400 mt-1 hidden sm:block">
                        Comprado: {formatDate(equipo.fechaCompra)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
