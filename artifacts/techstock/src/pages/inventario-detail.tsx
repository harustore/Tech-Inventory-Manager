import { useGetEquipo, useDeleteEquipo, useRegistrarVentaEquipo, useReactivarEquipo, useListPagosCuotas, useRegistrarPagoCuota, useEliminarPagoCuota, useUpdateEquipo, getGetEquipoQueryKey, getListPagosCuotasQueryKey } from "@workspace/api-client-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const updateEquipo = useUpdateEquipo();

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
    ventaNumeroCuotas: "",
    buyerName: "",
    buyerRut: "",
    buyerContact: "",
    meetingPlace: "",
    buyerPaymentMethod: "",
  });
  
  const [isVentaOpen, setIsVentaOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isEditVentaOpen, setIsEditVentaOpen] = useState(false);
  const [editVentaData, setEditVentaData] = useState({
    fechaVenta: "",
    plataformaVenta: "",
    precioVenta: "",
    ventaFormaPago: "Contado" as "Contado" | "Cuotas",
    ventaNumeroCuotas: "",
    buyerName: "",
    buyerRut: "",
    buyerContact: "",
    meetingPlace: "",
    buyerPaymentMethod: "",
  });

  const [isEditCompraOpen, setIsEditCompraOpen] = useState(false);
  const [editCompraData, setEditCompraData] = useState({
    fechaCompra: "",
    precioCompra: "",
    gastosExtra: "",
    formaPagoCompra: "Efectivo" as string,
    comentarios: "",
    sellerName: "",
    sellerRut: "",
    sellerContact: "",
    purchaseMeetingPlace: "",
  });

  const openEditCompra = () => {
    if (!equipo) return;
    setEditCompraData({
      fechaCompra: equipo.fechaCompra ?? new Date().toISOString().split('T')[0],
      precioCompra: equipo.precioCompra?.toString() ?? "",
      gastosExtra: equipo.gastosExtra?.toString() ?? "0",
      formaPagoCompra: equipo.formaPagoCompra,
      comentarios: equipo.comentarios ?? "",
      sellerName: equipo.sellerName ?? "",
      sellerRut: equipo.sellerRut ?? "",
      sellerContact: equipo.sellerContact ?? "",
      purchaseMeetingPlace: equipo.purchaseMeetingPlace ?? "",
    });
    setIsEditCompraOpen(true);
  };

  const handleEditCompra = (e: React.FormEvent) => {
    e.preventDefault();
    updateEquipo.mutate({
      id: equipoId,
      data: {
        fechaCompra: editCompraData.fechaCompra || undefined,
        precioCompra: Number(editCompraData.precioCompra),
        gastosExtra: Number(editCompraData.gastosExtra),
        formaPagoCompra: editCompraData.formaPagoCompra as any,
        comentarios: editCompraData.comentarios || null,
        sellerName: editCompraData.sellerName || null,
        sellerRut: editCompraData.sellerRut || null,
        sellerContact: editCompraData.sellerContact || null,
        purchaseMeetingPlace: editCompraData.purchaseMeetingPlace || null,
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "Compra actualizada" });
        setIsEditCompraOpen(false);
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al actualizar compra" });
      }
    });
  };

  const openEditSale = () => {
    if (!equipo) return;
    setEditVentaData({
      fechaVenta: equipo.fechaVenta ?? new Date().toISOString().split('T')[0],
      plataformaVenta: equipo.plataformaVenta ?? "",
      precioVenta: equipo.precioVenta?.toString() ?? "",
      ventaFormaPago: (equipo.ventaFormaPago as "Contado" | "Cuotas") ?? "Contado",
      ventaNumeroCuotas: equipo.ventaNumeroCuotas?.toString() ?? "",
      buyerName: equipo.buyerName ?? "",
      buyerRut: equipo.buyerRut ?? "",
      buyerContact: equipo.buyerContact ?? "",
      meetingPlace: equipo.meetingPlace ?? "",
      buyerPaymentMethod: equipo.buyerPaymentMethod ?? "",
    });
    setIsEditVentaOpen(true);
  };

  const handleEditSale = (e: React.FormEvent) => {
    e.preventDefault();
    updateEquipo.mutate({
      id: equipoId,
      data: {
        fechaVenta: editVentaData.fechaVenta || null,
        plataformaVenta: editVentaData.plataformaVenta || null,
        precioVenta: editVentaData.precioVenta ? Number(editVentaData.precioVenta) : null,
        ventaFormaPago: editVentaData.ventaFormaPago,
        ventaNumeroCuotas: editVentaData.ventaFormaPago === "Cuotas" ? Number(editVentaData.ventaNumeroCuotas) : null,
        buyerName: editVentaData.buyerName || null,
        buyerRut: editVentaData.buyerRut || null,
        buyerContact: editVentaData.buyerContact || null,
        meetingPlace: editVentaData.meetingPlace || null,
        buyerPaymentMethod: editVentaData.buyerPaymentMethod || null,
      }
    }, {
      onSuccess: (data) => {
        toast({ title: "Venta actualizada" });
        setIsEditVentaOpen(false);
        queryClient.setQueryData(getGetEquipoQueryKey(equipoId), data);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al actualizar la venta" });
      }
    });
  };

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
        ventaNumeroCuotas: ventaData.ventaFormaPago === "Cuotas" ? Number(ventaData.ventaNumeroCuotas) : undefined,
        buyerName: ventaData.buyerName || undefined,
        buyerRut: ventaData.buyerRut || undefined,
        buyerContact: ventaData.buyerContact || undefined,
        meetingPlace: ventaData.meetingPlace || undefined,
        buyerPaymentMethod: ventaData.buyerPaymentMethod || undefined,
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
  const pagosCuotasList = pagosCuotas ?? [];
  const totalPagadoCuotas = pagosCuotasList.reduce((sum, pago) => sum + pago.monto, 0);
  const totalCuotas = equipo?.ventaNumeroCuotas ?? 0;
  const valorCuota = equipo?.precioVenta && totalCuotas ? equipo.precioVenta / totalCuotas : 0;
  const cuotasRegistradas = pagosCuotasList.length;
  const cuotasPendientes = Math.max(0, totalCuotas - cuotasRegistradas);
  const progresoCuotas = equipo?.precioVenta ? (totalPagadoCuotas / equipo.precioVenta) * 100 : 0;

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

  if (!equipo) return <div className="text-center py-20 text-slate-500 dark:text-slate-400">Equipo no encontrado</div>;

  const isVendido = equipo.estado === "vendido";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/inventario")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{equipo.equipo}</h1>
            {isVendido ? (
              <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">Vendido</span>
            ) : equipo.estado === "reservado" ? (
               <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">Reservado</span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">En Stock</span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            {equipo.marca} {equipo.modelo}
            <span className="text-slate-300">•</span>
            {equipo.categoria}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {!isVendido && (
            <Dialog open={isVentaOpen} onOpenChange={setIsVentaOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
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
                          className={ventaData.ventaFormaPago === "Contado" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                          onClick={() => setVentaData({...ventaData, ventaFormaPago: "Contado", ventaNumeroCuotas: ""})}
                        >
                          Al contado
                        </Button>
                        <Button
                          type="button"
                          variant={ventaData.ventaFormaPago === "Cuotas" ? "default" : "outline"}
                          className={ventaData.ventaFormaPago === "Cuotas" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">Costo total: {formatCurrency(equipo.costoTotal)}</p>
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
                          <p className="text-xs text-slate-500 dark:text-slate-400">
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

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Datos del Comprador</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="buyerName">Nombre del Comprador</Label>
                          <Input
                            id="buyerName" placeholder="Nombre y apellido"
                            value={ventaData.buyerName} onChange={e => setVentaData({...ventaData, buyerName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="buyerRut">RUT / Documento</Label>
                          <Input
                            id="buyerRut" placeholder="Ej: 12.345.678-9"
                            value={ventaData.buyerRut} onChange={e => setVentaData({...ventaData, buyerRut: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="buyerContact">Contacto</Label>
                          <Input
                            id="buyerContact" placeholder="Teléfono o email"
                            value={ventaData.buyerContact} onChange={e => setVentaData({...ventaData, buyerContact: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="meetingPlace">Lugar de Encuentro</Label>
                          <Input
                            id="meetingPlace" placeholder="Dirección o punto de encuentro"
                            value={ventaData.meetingPlace} onChange={e => setVentaData({...ventaData, meetingPlace: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="buyerPaymentMethod">Medio de Pago del Comprador</Label>
                          <Input
                            id="buyerPaymentMethod" placeholder="Ej: Efectivo, Transferencia, Tarjeta"
                            value={ventaData.buyerPaymentMethod} onChange={e => setVentaData({...ventaData, buyerPaymentMethod: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsVentaOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={registrarVenta.isPending} className="bg-cyan-500">
                      {registrarVenta.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Confirmar Venta"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {isVendido && (
            <>
              <Button variant="outline" onClick={openEditSale}>
                <Edit className="w-4 h-4 mr-2" /> Editar Venta
              </Button>
              <Button variant="outline" onClick={handleReactivar} disabled={reactivar.isPending}>
                {reactivar.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                Deshacer Venta
              </Button>
            </>
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

          <Dialog open={isEditCompraOpen} onOpenChange={setIsEditCompraOpen}>
            <DialogContent>
              <form onSubmit={handleEditCompra}>
                <DialogHeader>
                  <DialogTitle>Editar Datos de Compra</DialogTitle>
                  <DialogDescription>Corrige el precio, gastos o fecha de adquisición.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-compra-fecha">Fecha de Compra</Label>
                    <Input
                      id="edit-compra-fecha" type="date" required
                      value={editCompraData.fechaCompra}
                      onChange={e => setEditCompraData({...editCompraData, fechaCompra: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-compra-precio">Precio Compra (CLP)</Label>
                    <Input
                      id="edit-compra-precio" type="number" required min="0"
                      value={editCompraData.precioCompra}
                      onChange={e => setEditCompraData({...editCompraData, precioCompra: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-compra-gastos">Gastos Extra (CLP)</Label>
                    <Input
                      id="edit-compra-gastos" type="number" min="0"
                      value={editCompraData.gastosExtra}
                      onChange={e => setEditCompraData({...editCompraData, gastosExtra: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-compra-forma">Forma de Pago</Label>
                    <Select value={editCompraData.formaPagoCompra} onValueChange={(val) => setEditCompraData({...editCompraData, formaPagoCompra: val})}>
                      <SelectTrigger id="edit-compra-forma">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-compra-comentarios">Comentarios</Label>
                    <Input
                      id="edit-compra-comentarios" placeholder="Notas adicionales..."
                      value={editCompraData.comentarios}
                      onChange={e => setEditCompraData({...editCompraData, comentarios: e.target.value})}
                    />
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Datos del vendedor</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-compra-sellerName">Nombre</Label>
                        <Input
                          id="edit-compra-sellerName" placeholder="¿A quién se lo compraste?"
                          value={editCompraData.sellerName}
                          onChange={e => setEditCompraData({...editCompraData, sellerName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-compra-sellerRut">RUT</Label>
                        <Input
                          id="edit-compra-sellerRut" placeholder="Ej: 12.345.678-9"
                          value={editCompraData.sellerRut}
                          onChange={e => setEditCompraData({...editCompraData, sellerRut: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-compra-sellerContact">Contacto</Label>
                        <Input
                          id="edit-compra-sellerContact" placeholder="Teléfono o email"
                          value={editCompraData.sellerContact}
                          onChange={e => setEditCompraData({...editCompraData, sellerContact: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-compra-purchaseMeetingPlace">Lugar de encuentro</Label>
                        <Input
                          id="edit-compra-purchaseMeetingPlace" placeholder="¿Dónde se realizó la compra?"
                          value={editCompraData.purchaseMeetingPlace}
                          onChange={e => setEditCompraData({...editCompraData, purchaseMeetingPlace: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditCompraOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={updateEquipo.isPending}>
                    {updateEquipo.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditVentaOpen} onOpenChange={setIsEditVentaOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleEditSale}>
                <DialogHeader>
                  <DialogTitle>Editar Venta</DialogTitle>
                  <DialogDescription>
                    Modifica los detalles de la venta. Esto actualizará el ingreso registrado en la caja.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-5 py-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Forma de pago</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Puedes dejarla en contado o volverla a cuotas.</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Costo total</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {equipo ? formatCurrency(equipo.costoTotal) : ""}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={editVentaData.ventaFormaPago === "Contado" ? "default" : "outline"}
                          className={cn(
                            "h-11 justify-start",
                            editVentaData.ventaFormaPago === "Contado" ? "bg-cyan-500 hover:bg-cyan-600" : ""
                          )}
                          onClick={() => setEditVentaData({...editVentaData, ventaFormaPago: "Contado", ventaNumeroCuotas: ""})}
                        >
                          Al contado
                        </Button>
                        <Button
                          type="button"
                          variant={editVentaData.ventaFormaPago === "Cuotas" ? "default" : "outline"}
                          className={cn(
                            "h-11 justify-start",
                            editVentaData.ventaFormaPago === "Cuotas" ? "bg-cyan-500 hover:bg-cyan-600" : ""
                          )}
                          onClick={() => setEditVentaData({...editVentaData, ventaFormaPago: "Cuotas"})}
                        >
                          En cuotas
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="editPrecioVenta">Precio de Venta (CLP)</Label>
                        <Input
                          id="editPrecioVenta" type="number" required min="0"
                          value={editVentaData.precioVenta}
                          onChange={e => setEditVentaData({...editVentaData, precioVenta: e.target.value})}
                        />
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">
                            Costo total: {equipo ? formatCurrency(equipo.costoTotal) : ""}
                          </span>
                          {(() => {
                            const pv = Number(editVentaData.precioVenta) || 0;
                            const ct = equipo?.costoTotal ?? 0;
                            const gn = pv - ct;
                            const mg = ct > 0 ? Math.round((gn / ct) * 100) : 0;
                            if (!pv) return null;
                            return (
                              <span className={cn(
                                "rounded-full px-2.5 py-1 font-medium",
                                gn >= 0
                                  ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200"
                                  : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-200"
                              )}>
                                Ganancia estimada {gn >= 0 ? "+" : ""}{formatCurrency(gn)} · {mg}% margen
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {editVentaData.ventaFormaPago === "Cuotas" && (
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="editVentaNumeroCuotas">Número de Cuotas</Label>
                          <Input
                            id="editVentaNumeroCuotas" type="number" required min="2" step="1"
                            placeholder="Ej: 3"
                            value={editVentaData.ventaNumeroCuotas}
                            onChange={e => setEditVentaData({...editVentaData, ventaNumeroCuotas: e.target.value})}
                          />
                          {Number(editVentaData.precioVenta) > 0 && Number(editVentaData.ventaNumeroCuotas) > 0 && (
                            <div className="rounded-xl border border-dashed border-cyan-300 bg-cyan-50 px-3 py-2 text-sm text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300">
                              {editVentaData.ventaNumeroCuotas} cuotas de {formatCurrency(Number(editVentaData.precioVenta) / Number(editVentaData.ventaNumeroCuotas))} c/u
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="editFechaVenta">Fecha</Label>
                        <Input
                          id="editFechaVenta" type="date" required
                          value={editVentaData.fechaVenta}
                          onChange={e => setEditVentaData({...editVentaData, fechaVenta: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="editPlataformaVenta">Plataforma / Medio de Venta</Label>
                        <Input
                          id="editPlataformaVenta" required placeholder="Ej: Marketplace, Instagram, Local..."
                          value={editVentaData.plataformaVenta}
                          onChange={e => setEditVentaData({...editVentaData, plataformaVenta: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Resumen</p>
                      <div className="mt-3 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Modo</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{editVentaData.ventaFormaPago}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Precio</span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {editVentaData.precioVenta ? formatCurrency(Number(editVentaData.precioVenta)) : "—"}
                          </span>
                        </div>
                        {editVentaData.ventaFormaPago === "Cuotas" && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Cuotas</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {editVentaData.ventaNumeroCuotas || "—"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Valor por cuota</span>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {Number(editVentaData.precioVenta) > 0 && Number(editVentaData.ventaNumeroCuotas) > 0
                                  ? formatCurrency(Number(editVentaData.precioVenta) / Number(editVentaData.ventaNumeroCuotas))
                                  : "—"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-4 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Datos del comprador</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="editBuyerName">Nombre</Label>
                          <Input
                            id="editBuyerName" placeholder="Nombre y apellido"
                            value={editVentaData.buyerName}
                            onChange={e => setEditVentaData({...editVentaData, buyerName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="editBuyerRut">RUT / Documento</Label>
                          <Input
                            id="editBuyerRut" placeholder="Ej: 12.345.678-9"
                            value={editVentaData.buyerRut}
                            onChange={e => setEditVentaData({...editVentaData, buyerRut: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="editBuyerContact">Contacto</Label>
                          <Input
                            id="editBuyerContact" placeholder="Teléfono o email"
                            value={editVentaData.buyerContact}
                            onChange={e => setEditVentaData({...editVentaData, buyerContact: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label htmlFor="editMeetingPlace">Lugar de Encuentro</Label>
                          <Input
                            id="editMeetingPlace" placeholder="Dirección o punto de encuentro"
                            value={editVentaData.meetingPlace}
                            onChange={e => setEditVentaData({...editVentaData, meetingPlace: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="editBuyerPaymentMethod">Medio de Pago del Comprador</Label>
                          <Input
                            id="editBuyerPaymentMethod" placeholder="Ej: Efectivo, Transferencia, Tarjeta"
                            value={editVentaData.buyerPaymentMethod}
                            onChange={e => setEditVentaData({...editVentaData, buyerPaymentMethod: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setIsEditVentaOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={updateEquipo.isPending} className="bg-cyan-500">
                    {updateEquipo.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Guardar cambios"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 pb-4 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Detalles Técnicos</CardTitle>
                  <CardDescription>Especificaciones y estado físico</CardDescription>
                </div>
                <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white dark:bg-slate-100 dark:text-slate-950">
                  #{equipo.id}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <dl className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Tag className="w-4 h-4" /> Condición</dt>
                  <dd className="sm:col-span-2">
                    <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                      {equipo.estadoEquipoCondicion}
                    </span>
                  </dd>
                </div>
                {equipo.bateriaPct !== null && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Battery className="w-4 h-4" /> Salud Batería</dt>
                    <dd className="sm:col-span-2">
                      <div className="flex items-center gap-3">
                          <div className="h-2.5 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, equipo.bateriaPct ?? 0)}%`, backgroundColor: progressColor(equipo.bateriaPct ?? 0) }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{equipo.bateriaPct}%</span>
                      </div>
                    </dd>
                  </div>
                )}
                {equipo.imeiSerial && (
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors">
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Info className="w-4 h-4" /> IMEI / Serie</dt>
                    <dd className="sm:col-span-2">
                      <span className="inline-flex max-w-full break-all rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                        {equipo.imeiSerial}
                      </span>
                    </dd>
                  </div>
                )}
                <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 transition-colors">
                  <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Info className="w-4 h-4" /> ID Sistema</dt>
                  <dd className="sm:col-span-2">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      #{equipo.id}
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {equipo.comentarios && (
            <Card className="border-slate-200 shadow-sm dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Comentarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{equipo.comentarios}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          <Card className={cn(
            "border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden",
            isVendido ? "bg-gradient-to-b from-cyan-50 to-white border-cyan-100 dark:from-cyan-950/35 dark:to-slate-950" : "bg-white dark:bg-slate-950"
          )}>
            <CardHeader className="pb-4 border-b border-slate-100/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Resumen Financiero</CardTitle>
                  <CardDescription>Compra, venta y utilidad del equipo</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-slate-500 dark:text-slate-400" onClick={openEditCompra}>
                  <Edit className="w-4 h-4 mr-1.5" /> Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Precio Compra</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{formatCurrency(equipo.precioCompra)}</span>
                </div>
                {equipo.gastosExtra > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Gastos Extra</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">+{formatCurrency(equipo.gastosExtra)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Costo Total</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">{formatCurrency(equipo.costoTotal)}</span>
                </div>
              </div>

              {isVendido && equipo.precioVenta != null && equipo.gananciaNeta != null && (
                <div className="space-y-3 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-cyan-700 font-medium">Valor Final Venta</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-700">{formatCurrency(equipo.precioVenta)}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-cyan-600" onClick={openEditSale}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {equipo.ventaFormaPago === "Cuotas" && equipo.ventaNumeroCuotas ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-50 dark:border-cyan-900 dark:from-cyan-950/40 dark:via-slate-950 dark:to-slate-900 p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200">
                              Venta en cuotas
                            </p>
                            <h4 className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-50">
                              Cobranza activa
                            </h4>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              {totalCuotas} cuotas de {formatCurrency(valorCuota)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-white/80 dark:bg-slate-950/70 px-3 py-2 text-right ring-1 ring-cyan-200/70 dark:ring-cyan-900/70">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Pendientes</p>
                            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{cuotasPendientes}</p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-white/90 dark:bg-slate-950/80 p-3 ring-1 ring-slate-200 dark:ring-slate-800">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Pagado</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">
                              {formatCurrency(totalPagadoCuotas)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">de {formatCurrency(equipo.precioVenta)}</p>
                          </div>
                          <div className="rounded-xl bg-white/90 dark:bg-slate-950/80 p-3 ring-1 ring-slate-200 dark:ring-slate-800">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Progreso</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{Math.round(progresoCuotas)}%</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{cuotasRegistradas} pagos</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Avance de cobranza</span>
                            <span>{formatCurrency(valorCuota)} por cuota</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-950/80 ring-1 ring-cyan-200 dark:ring-cyan-900">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, progresoCuotas)}%`, backgroundColor: progressColor(progresoCuotas) }}
                            />
                          </div>
                        </div>
                      </div>

                      {pagosCuotasList.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-sm">
                          <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historial de pagos</p>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pagosCuotasList.map((pago, idx) => (
                              <div key={pago.id} className="flex items-center justify-between gap-3 px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Cuota {idx + 1}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(pago.fecha)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(pago.monto)}</span>
                                  <Button
                                    type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600"
                                    onClick={() => handleEliminarPago(pago.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {totalCuotas > cuotasRegistradas && (
                        <form onSubmit={handleRegistrarPago} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 p-4 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Registrar nueva cuota</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Te quedan {cuotasPendientes} pagos por registrar.
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="montoPago" className="text-xs">Monto</Label>
                              <Input
                                id="montoPago" type="number" min="1" max={Math.max(0, (equipo.precioVenta ?? 0) - totalPagadoCuotas)} required
                                value={nuevoPago.monto}
                                onChange={e => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                              />
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Saldo disponible: {formatCurrency(Math.max(0, (equipo.precioVenta ?? 0) - totalPagadoCuotas))}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="fechaPago" className="text-xs">Fecha</Label>
                              <Input
                                id="fechaPago" type="date" required
                                value={nuevoPago.fecha}
                                onChange={e => setNuevoPago({ ...nuevoPago, fecha: e.target.value })}
                              />
                            </div>
                            <Button
                              type="submit" className="h-11 bg-cyan-500 hover:bg-cyan-600"
                              disabled={registrarPagoCuota.isPending}
                            >
                              {registrarPagoCuota.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar cuota"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Forma de pago</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Al contado</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">Ganancia Neta</span>
                    <span className={cn(
                      "font-bold text-xl",
                      equipo.gananciaNeta > 0 ? "text-cyan-600" : "text-red-600"
                    )}>
                      {equipo.gananciaNeta > 0 ? "+" : ""}{formatCurrency(equipo.gananciaNeta)}
                    </span>
                  </div>
                  {equipo.costoTotal > 0 && (
                    <div className="flex justify-end">
                      <span className="text-xs font-medium px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full dark:bg-cyan-900/50 dark:text-cyan-200">
                        Margen: {Math.round((equipo.gananciaNeta / equipo.costoTotal) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700">
             <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 pb-3 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 ring-4 ring-white dark:ring-slate-950">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Comprado</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(equipo.fechaCompra)} • {equipo.formaPagoCompra}</p>
                  {equipo.proveedorNombre && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Prov: {equipo.proveedorNombre}</p>}
                  {equipo.sellerName && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1 dark:border-slate-700 dark:bg-slate-900/50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Vendedor</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{equipo.sellerName}{equipo.sellerRut ? ` • ${equipo.sellerRut}` : ""}</p>
                      {equipo.sellerContact && <p className="text-xs text-slate-500 dark:text-slate-400">Contacto: {equipo.sellerContact}</p>}
                      {equipo.purchaseMeetingPlace && <p className="text-xs text-slate-500 dark:text-slate-400">Encuentro: {equipo.purchaseMeetingPlace}</p>}
                    </div>
                  )}
                </div>
              </div>
              
              {isVendido && equipo.fechaVenta && (
                <div className="flex gap-3 relative before:absolute before:left-4 before:top-[-16px] before:bottom-8 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                  <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center shrink-0 z-10 text-cyan-600 ring-4 ring-white dark:ring-slate-950">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Vendido</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(equipo.fechaVenta)}</p>
                    {equipo.plataformaVenta && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">En: {equipo.plataformaVenta}</p>}
                    {equipo.buyerName && (
                      <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 space-y-1 dark:border-cyan-900 dark:bg-cyan-950/30">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-200">Comprador</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{equipo.buyerName}{equipo.buyerRut ? ` • ${equipo.buyerRut}` : ""}</p>
                        {equipo.buyerContact && <p className="text-xs text-slate-500 dark:text-slate-400">Contacto: {equipo.buyerContact}</p>}
                        {equipo.meetingPlace && <p className="text-xs text-slate-500 dark:text-slate-400">Encuentro: {equipo.meetingPlace}</p>}
                        {equipo.buyerPaymentMethod && <p className="text-xs text-slate-500 dark:text-slate-400">Pago: {equipo.buyerPaymentMethod}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

           {/* Mobile Action Buttons (visible only on small screens) */}
          <div className="flex flex-col gap-2 sm:hidden pt-4">
             {!isVendido && (
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => setIsVentaOpen(true)}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Registrar Venta
                </Button>
              )}
               {isVendido && (
                <>
                  <Button variant="outline" className="w-full" onClick={openEditSale}>
                    <Edit className="w-4 h-4 mr-2" /> Editar Venta
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleReactivar} disabled={reactivar.isPending}>
                    {reactivar.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                    Deshacer Venta
                  </Button>
                </>
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

