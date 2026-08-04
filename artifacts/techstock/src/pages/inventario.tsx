import { useState, useRef, useEffect } from "react";
import {
  useListEquipos,
  getListEquiposQueryKey,
  EstadoEquipo,
  Categoria,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { formatCurrency, daysBetween, cn, downloadCsv } from "@/lib/utils";
import {
  Search,
  Plus,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Camera,
  PackageSearch,
  Battery,
  ArrowUpDown,
  Filter,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Inventario() {
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoEquipo | "todos">("en_stock");
  const [categoriaFilter, setCategoriaFilter] = useState<Categoria | "todos">("todos");
  const [sortBy, setSortBy] = useState<"fecha-desc" | "fecha-asc" | "precio-asc" | "precio-desc">("fecha-desc");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const equiposParams = {
    search: search || undefined,
    estado: estadoFilter === "todos" ? undefined : estadoFilter,
    categoria: categoriaFilter === "todos" ? undefined : categoriaFilter,
  };

  const { data: equipos, isLoading } = useListEquipos(equiposParams, {
    query: {
      queryKey: getListEquiposQueryKey(equiposParams),
    },
  });

  const sorted = equipos
    ? [...equipos].sort((a, b) => {
        switch (sortBy) {
          case "fecha-asc":
            return new Date(a.fechaCompra).getTime() - new Date(b.fechaCompra).getTime();
          case "fecha-desc":
            return new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime();
          case "precio-asc":
            return a.costoTotal - b.costoTotal;
          case "precio-desc":
            return b.costoTotal - a.costoTotal;
          default:
            return 0;
        }
      })
    : undefined;

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "Celular":
        return <Smartphone className="w-5 h-5 text-blue-500" />;
      case "Notebook":
      case "PC Escritorio":
        return <Laptop className="w-5 h-5 text-indigo-500" />;
      case "TV":
      case "TV Box":
        return <Tv className="w-5 h-5 text-purple-500" />;
      case "Audifonos":
        return <Headphones className="w-5 h-5 text-rose-500" />;
      case "Smartwatch":
        return <Watch className="w-5 h-5 text-amber-500" />;
      case "Camara":
      case "Lentes":
        return <Camera className="w-5 h-5 text-cyan-500" />;
      default:
        return <PackageSearch className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getEstadoBadge = (estado: EstadoEquipo) => {
    switch (estado) {
      case "en_stock":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">En stock</Badge>;
      case "reservado":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">Reservado</Badge>;
      case "vendido":
        return <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20">Vendido</Badge>;
    }
  };

  const hasFilters = search || estadoFilter !== "todos" || categoriaFilter !== "todos";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-cyan-50 shadow-sm dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_26%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/60 dark:bg-white/10" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                Inventario activo
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-4xl">
                  Inventario más claro, con lectura rápida y mejor foco.
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Busca, filtra y ordena el inventario con una interfaz más limpia para tomar decisiones rápido.
                </p>
              </div>
            </div>

            <Link
              href="/inventario/nuevo"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar compra
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Filtro rápido</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Usa los filtros para reducir la lista sin perder contexto.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Orden</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Prioriza lo más reciente o el costo según tu flujo.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Detalle</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Cada tarjeta muestra estado, valor y antigüedad de forma compacta.</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por equipo, marca, modelo o IMEI..."
                className="border-slate-200 bg-slate-50/80 pl-9 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[760px] xl:grid-cols-3">
              <Select value={estadoFilter} onValueChange={(val) => setEstadoFilter(val as any)}>
                <SelectTrigger className="border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="en_stock">En stock</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoriaFilter} onValueChange={(val) => setCategoriaFilter(val as any)}>
                <SelectTrigger className="border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  <SelectItem value="Celular">Celular</SelectItem>
                  <SelectItem value="Notebook">Notebook</SelectItem>
                  <SelectItem value="PC Escritorio">PC Escritorio</SelectItem>
                  <SelectItem value="Consola">Consola</SelectItem>
                  <SelectItem value="TV">TV</SelectItem>
                  <SelectItem value="Audifonos">Audífonos</SelectItem>
                  <SelectItem value="Smartwatch">Smartwatch</SelectItem>
                  <SelectItem value="Camara">Cámara</SelectItem>
                  <SelectItem value="TV Box">TV Box</SelectItem>
                  <SelectItem value="Carcasa">Carcasa</SelectItem>
                  <SelectItem value="Lentes">Lentes</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-slate-400" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fecha-desc">Más recientes</SelectItem>
                  <SelectItem value="fecha-asc">Más antiguos</SelectItem>
                  <SelectItem value="precio-asc">Menor costo</SelectItem>
                  <SelectItem value="precio-desc">Mayor costo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              disabled={!sorted?.length}
              onClick={() => downloadCsv("techstock-inventario.csv", (sorted ?? []).map((equipo) => ({
                Equipo: equipo.equipo,
                Marca: equipo.marca,
                Modelo: equipo.modelo,
                Estado: equipo.estado,
                Categoría: equipo.categoria,
                Costo: equipo.costoTotal,
                Venta: equipo.precioVenta,
                Compra: equipo.fechaCompra,
              })))}
            >
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Filtros activos
              </span>
              {search && (
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                  "{search}"
                </span>
              )}
              {estadoFilter !== "todos" && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {estadoFilter === "en_stock" ? "En stock" : estadoFilter === "reservado" ? "Reservado" : "Vendido"}
                </span>
              )}
              {categoriaFilter !== "todos" && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {categoriaFilter}
                </span>
              )}
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setEstadoFilter("todos");
                  setCategoriaFilter("todos");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : equipos?.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/85 px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
          <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">No hay equipos</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No se encontraron equipos con los filtros actuales.
          </p>
          {hasFilters ? (
            <Button
              variant="outline"
              className="mt-5 rounded-xl"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setEstadoFilter("todos");
                setCategoriaFilter("todos");
              }}
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button
              className="mt-5 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600"
              onClick={() => setLocation("/inventario/nuevo")}
            >
              Registrar primer equipo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sorted?.map((equipo, index) => (
            <Card
              key={equipo.id}
              className={cn(
                "group overflow-hidden rounded-3xl border-slate-200/80 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-950/5 dark:border-slate-700 dark:bg-slate-950/80 dark:hover:border-cyan-500/30 dark:hover:shadow-cyan-950/20",
                `animate-in fade-in slide-in-from-bottom-2 duration-${Math.min(index * 100 + 300, 700)}`,
                equipo.estado === "vendido" && "bg-slate-50/70 opacity-85 dark:bg-slate-950/50",
              )}
              onClick={() => setLocation(`/inventario/${equipo.id}`)}
            >
              <CardContent className="p-0">
                <div className="grid gap-4 p-4 md:grid-cols-[1.15fr_1.7fr_0.95fr] md:items-center md:p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
                      {getCategoryIcon(equipo.categoria)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
                          {equipo.equipo}
                        </h3>
                        {getEstadoBadge(equipo.estado)}
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {equipo.marca} {equipo.modelo}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 dark:text-slate-300">
                          {equipo.estadoEquipoCondicion}
                        </span>
                        {equipo.bateriaPct !== null && equipo.bateriaPct !== undefined && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800 dark:text-slate-300">
                            <Battery className="h-3.5 w-3.5" />
                            {equipo.bateriaPct}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:justify-self-start">
                    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Costo total</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">{formatCurrency(equipo.costoTotal)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-3 dark:border-slate-700 dark:from-slate-900 dark:to-slate-950">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Antigüedad</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">
                        {equipo.estado !== "vendido"
                          ? `${daysBetween(equipo.fechaCompra)} días`
                          : equipo.fechaVenta
                          ? `${daysBetween(equipo.fechaCompra, equipo.fechaVenta)} días`
                            : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="md:justify-self-end">
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 md:w-44">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Venta</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {equipo.estado === "vendido" && equipo.precioVenta
                            ? formatCurrency(equipo.precioVenta)
                            : "Disponible"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                        <Plus className="h-4 w-4 rotate-45" />
                      </div>
                    </div>
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

