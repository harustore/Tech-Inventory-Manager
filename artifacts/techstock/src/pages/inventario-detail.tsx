import { useGetEquipo, useDeleteEquipo, useRegistrarVentaEquipo, useReactivarEquipo, useListPagosCuotas, useRegistrarPagoCuota, useEliminarPagoCuota, getGetEquipoQueryKey, getListPagosCuotasQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "wouter";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Trash2, Edit, ShoppingCart, RotateCcw, AlertTriangle, Smartphone, Laptop, Tv, Headphones, Watch, Camera, PackageSearch, Tag, Info, Calendar, DollarSign, Battery } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function InventarioDetail() {
  const { id } = useParams();
  const equipoId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: equipo, isLoading } = useGetEquipo(equipoId, {
    query: {
      enabled: !!equipoId && !isNaN(equipoId),
      queryKey: getGetEquipoQueryKey(equipoId)
    }
  });

  const deleteEquipo = useDeleteEquipo();
  const registrarVenta = useRegistrarVentaEquipo();
  const reactivar = useReactivarEquipo();
  const registrarPagoCuota = useRegistrarPagoCuota();
  const eliminarPagoCuota = useEliminarPagoCuota();

  const esVentaEnCuotas = equipo?.estado === "vendido" && equipo?.ventaFormaPago === "Cuotas";
  const { data: pagosCuotas } = useListPagosCuotas(equipoId, {
    query: {
      enabled: !!equipoId && !isNaN(equipoId) && esVentaEnCuotas,
      queryKey: getListPagosCuotasQueryKey(equipoId)
    }
  });

  const [nuevoPago, setNuevoPago] = useState({
    monto: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  const [ventaData, setVentaData] = useState({
    fechaVenta: new Date().toISOString().split('T')[0],
    plataformaVenta: "",
    precioVenta: "",
    ventaFormaPago: "Contado" as "Contado" | "Cuotas",
    ventaNumeroCuotas: ""
  });
  
  const [isVentaOpen, setIsVentaOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteEquipo.mutate({ id: equipoId }, {
      onSuccess: () => {
        toast({ title: "Equipo eliminado" });
        setLocation("/inventario");
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al eliminar" });
      }
    });
  };

  const handleVender = (e: React.FormEvent) => {
    e.preventDefault();
    registrarVenta.mutate({
      id: equipoId,
      data: {
        fechaVenta: ventaData.fechaVenta,
        plataformaVenta: ventaData.plataformaVenta,
        precioVenta: Number(ventaData.precioVenta),
        ventaFormaPago: ventaData.ventaFormaPago,
        ventaNumeroCuotas: ventaData.ventaFormaPago === "Cuotas" ? Number(ventaData.ventaNumeroCuotas) : undefined
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "Venta registrada con éxito" });
        setIsVentaOpen(false);
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al registrar la venta" });
      }
    });
  };

  const handleReactivar = () => {
    reactivar.mutate({ id: equipoId }, {
      onSuccess: (data) => {
        toast({ title: "Equipo devuelto al inventario" });
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al reactivar" });
      }
    });
  };

  const handleRegistrarPago = (e: React.FormEvent) => {
    e.preventDefault();
    registrarPagoCuota.mutate({
      id: equipoId,
      data: { monto: Number(nuevoPago.monto), fecha: nuevoPago.fecha }
    }, {
      onSuccess: (data) => {
        toast({ title: "Pago de cuota registrado" });
        setNuevoPago({ monto: "", fecha: new Date().toISOString().split('T')[0] });
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
        queryClient.invalidateQueries({ queryKey: getListPagosCuotasQueryKey(equipoId) });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al registrar el pago" });
      }
    });
  };

  const handleEliminarPago = (pagoId: number) => {
    if (!confirm("¿Eliminar este pago?")) return;
    eliminarPagoCuota.mutate({ id: pagoId }, {
      onSuccess: (data) => {
        toast({ title: "Pago eliminado" });
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
        queryClient.invalidateQueries({ queryKey: getListPagosCuotasQueryKey(equipoId) });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al eliminar el pago" });
      }
    });
  };

  /** Interpolates a red-to-green color for a 0-100 progress percentage. */
  function progressColor(pct: number) {
    const clamped = Math.max(0, Math.min(100, pct));
    const hue = (clamped / 100) * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 75%, 45%)`;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] md:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!equipo) return <div className="text-center py-20 text-slate-500">Equipo no encontrado</div>;

  const isVendido = equipo.estado === "vendido";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/inventario")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{equipo.equipo}</h1>
            {isVendido ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">Vendido</span>
            ) : equipo.estado === "reservado" ? (
               <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Reservado</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">En Stock</span>
            )}
          </div>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            {equipo.marca} {equipo.modelo}
            <span className="text-slate-300">•</span>
            {equipo.categoria}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {!isVendido && (
            <Dialog open={isVentaOpen} onOpenChange={setIsVentaOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" /> Registrar Venta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleVender}>
                  <DialogHeader>
                    <DialogTitle>Registrar Venta</DialogTitle>
                    <DialogDescription>
                      Ingresa los detalles de la venta. Esto actualizará el estado del equipo y registrará el ingreso en la caja.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Forma de Pago</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={ventaData.ventaFormaPago === "Contado" ? "default" : "outline"}
                          className={ventaData.ventaFormaPago === "Contado" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                          onClick={() => setVentaData({...ventaData, ventaFormaPago: "Contado", ventaNumeroCuotas: ""})}
                        >
                          Al contado
                        </Button>
                        <Button
                          type="button"
                          variant={ventaData.ventaFormaPago === "Cuotas" ? "default" : "outline"}
                          className={ventaData.ventaFormaPago === "Cuotas" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                          onClick={() => setVentaData({...ventaData, ventaFormaPago: "Cuotas"})}
                        >
                          En cuotas
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="precioVenta">
                        {ventaData.ventaFormaPago === "Cuotas" ? "Valor Final Total (CLP)" : "Precio de Venta (CLP)"}
                      </Label>
                      <Input 
                        id="precioVenta" type="number" required min="0"
                        value={ventaData.precioVenta} onChange={e => setVentaData({...ventaData, precioVenta: e.target.value})}
                      />
                      <p className="text-xs text-slate-500">Costo total: {formatCurrency(equipo.costoTotal)}</p>
                    </div>
                    {ventaData.ventaFormaPago === "Cuotas" && (
                      <div className="space-y-2">
                        <Label htmlFor="ventaNumeroCuotas">Número de Cuotas</Label>
                        <Input
                          id="ventaNumeroCuotas" type="number" required min="2" step="1"
                          placeholder="Ej: 3"
                          value={ventaData.ventaNumeroCuotas} onChange={e => setVentaData({...ventaData, ventaNumeroCuotas: e.target.value})}
                        />
                        {Number(ventaData.precioVenta) > 0 && Number(ventaData.ventaNumeroCuotas) > 0 && (
                          <p className="text-xs text-slate-500">
                            {ventaData.ventaNumeroCuotas} cuotas de {formatCurrency(Number(ventaData.precioVenta) / Number(ventaData.ventaNumeroCuotas))} c/u
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="fechaVenta">Fecha</Label>
                      <Input 
                        id="fechaVenta" type="date" required
                        value={ventaData.fechaVenta} onChange={e => setVentaData({...ventaData, fechaVenta: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plataformaVenta">Plataforma / Medio de Venta</Label>
                      <Input 
                        id="plataformaVenta" required placeholder="Ej: Marketplace, Instagram, Local..."
                        value={ventaData.plataformaVenta} onChange={e => setVentaData({...ventaData, plataformaVenta: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsVentaOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={registrarVenta.isPending} className="bg-emerald-500">
                      {registrarVenta.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Confirmar Venta"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {isVendido && (
            <Button variant="outline" onClick={handleReactivar} disabled={reactivar.isPending}>
              {reactivar.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
              Deshacer Venta
            </Button>
          )}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Eliminar equipo
                </DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar este equipo del inventario? Esta acción no se puede deshacer y eliminará los movimientos de caja asociados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteEquipo.isPending}>
                  {deleteEquipo.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sí, eliminar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Detalles Técnicos</CardTitle>
                <CardDescription>Especificaciones y estado físico</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-slate-500">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100">
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 hover:bg-slate-50 transition-colors">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Condición</dt>
                  <dd className="text-sm text-slate-900 sm:col-span-2 font-medium">{equipo.estadoEquipoCondicion}</dd>
                </div>
                {equipo.bateriaPct !== null && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 hover:bg-slate-50 transition-colors">
                    <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Battery className="w-4 h-4" /> Salud Batería</dt>
                    <dd className="text-sm text-slate-900 sm:col-span-2 font-medium">{equipo.bateriaPct}%</dd>
                  </div>
                )}
                {equipo.imeiSerial && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 hover:bg-slate-50 transition-colors">
                    <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Info className="w-4 h-4" /> IMEI / Serie</dt>
                    <dd className="text-sm text-slate-900 sm:col-span-2 font-mono bg-slate-100 px-2 py-1 rounded inline-block w-max">{equipo.imeiSerial}</dd>
                  </div>
                )}
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 hover:bg-slate-50 transition-colors">
                  <dt className="text-sm font-medium text-slate-500 flex items-center gap-2"><Info className="w-4 h-4" /> ID Sistema</dt>
                  <dd className="text-sm text-slate-500 sm:col-span-2">#{equipo.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {equipo.comentarios && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Comentarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{equipo.comentarios}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className={cn(
            "border-slate-200 shadow-sm",
            isVendido ? "bg-emerald-50 border-emerald-100" : ""
          )}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Precio Compra</span>
                  <span className="font-medium text-slate-900">{formatCurrency(equipo.precioCompra)}</span>
                </div>
                {equipo.gastosExtra > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Gastos Extra</span>
                    <span className="font-medium text-slate-900">+{formatCurrency(equipo.gastosExtra)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                  <span className="font-medium text-slate-700">Costo Total</span>
                  <span className="font-bold text-slate-900 text-lg">{formatCurrency(equipo.costoTotal)}</span>
                </div>
              </div>

              {isVendido && equipo.precioVenta != null && equipo.gananciaNeta != null && (
                <div className="space-y-3 pt-6 border-t border-slate-200/60">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700 font-medium">Valor Final Venta</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(equipo.precioVenta)}</span>
                  </div>
                  {equipo.ventaFormaPago === "Cuotas" && equipo.ventaNumeroCuotas ? (
                    (() => {
                      const montoPagado = (pagosCuotas ?? []).reduce((sum, p) => sum + p.monto, 0);
                      const pct = equipo.precioVenta > 0 ? (montoPagado / equipo.precioVenta) * 100 : 0;
                      const cuotasPagadas = pagosCuotas?.length ?? 0;
                      const completo = cuotasPagadas >= equipo.ventaNumeroCuotas!;
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Pago en cuotas</span>
                            <span className="font-medium text-slate-900">
                              {equipo.ventaNumeroCuotas} cuotas de {formatCurrency(equipo.precioVenta / equipo.ventaNumeroCuotas)}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Pagado</span>
                              <span className="font-semibold text-slate-900">
                                {formatCurrency(montoPagado)} de {formatCurrency(equipo.precioVenta)}
                                {completo && <span className="text-emerald-600"> · Completo</span>}
                              </span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, pct)}%`, backgroundColor: progressColor(pct) }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                              <span>{cuotasPagadas} de {equipo.ventaNumeroCuotas} cuotas registradas</span>
                              <span>{Math.round(pct)}%</span>
                            </div>

                            {(pagosCuotas?.length ?? 0) > 0 && (
                              <div className="space-y-1 pt-1 border-t border-slate-200/70">
                                {pagosCuotas!.map((pago, idx) => (
                                  <div key={pago.id} className="flex justify-between items-center text-sm py-1">
                                    <span className="text-slate-500">Cuota {idx + 1} · {formatDate(pago.fecha)}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-slate-900">{formatCurrency(pago.monto)}</span>
                                      <Button
                                        type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600"
                                        onClick={() => handleEliminarPago(pago.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!completo && (
                              <form onSubmit={handleRegistrarPago} className="flex items-end gap-2 pt-2 border-t border-slate-200/70">
                                <div className="space-y-1 flex-1">
                                  <Label htmlFor="montoPago" className="text-xs">Monto pagado</Label>
                                  <Input
                                    id="montoPago" type="number" min="0" required
                                    className="h-8 bg-white"
                                    value={nuevoPago.monto}
                                    onChange={e => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="fechaPago" className="text-xs">Fecha</Label>
                                  <Input
                                    id="fechaPago" type="date" required
                                    className="h-8 bg-white"
                                    value={nuevoPago.fecha}
                                    onChange={e => setNuevoPago({ ...nuevoPago, fecha: e.target.value })}
                                  />
                                </div>
                                <Button
                                  type="submit" size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600"
                                  disabled={registrarPagoCuota.isPending}
                                >
                                  {registrarPagoCuota.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Registrar"}
                                </Button>
                              </form>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Forma de pago</span>
                      <span className="font-medium text-slate-900">Al contado</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-bold text-slate-900">Ganancia Neta</span>
                    <span className={cn(
                      "font-bold text-xl",
                      equipo.gananciaNeta > 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {equipo.gananciaNeta > 0 ? "+" : ""}{formatCurrency(equipo.gananciaNeta)}
                    </span>
                  </div>
                  {equipo.costoTotal > 0 && (
                    <div className="flex justify-end">
                      <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        Margen: {Math.round((equipo.gananciaNeta / equipo.costoTotal) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
             <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Comprado</p>
                  <p className="text-xs text-slate-500">{formatDate(equipo.fechaCompra)} • {equipo.formaPagoCompra}</p>
                  {equipo.proveedorNombre && <p className="text-xs text-slate-500 mt-0.5">Prov: {equipo.proveedorNombre}</p>}
                </div>
              </div>
              
              {isVendido && equipo.fechaVenta && (
                <div className="flex gap-3 relative before:absolute before:left-4 before:top-[-16px] before:bottom-8 before:w-px before:bg-slate-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 z-10 text-emerald-600 ring-4 ring-white">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Vendido</p>
                    <p className="text-xs text-slate-500">{formatDate(equipo.fechaVenta)}</p>
                    {equipo.plataformaVenta && <p className="text-xs text-slate-500 mt-0.5">En: {equipo.plataformaVenta}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Mobile Action Buttons (visible only on small screens) */}
          <div className="flex flex-col gap-2 sm:hidden pt-4">
             {!isVendido && (
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setIsVentaOpen(true)}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Registrar Venta
                </Button>
              )}
               {isVendido && (
                <Button variant="outline" className="w-full" onClick={handleReactivar} disabled={reactivar.isPending}>
                  {reactivar.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  Deshacer Venta
                </Button>
              )}
               <Button variant="outline" className="w-full text-red-600" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar equipo
                </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
