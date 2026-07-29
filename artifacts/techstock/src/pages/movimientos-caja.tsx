import { useState } from "react";
import { useListMovimientosCaja, useCreateMovimientoCaja, useUpdateMovimientoCaja, useDeleteMovimientoCaja, TipoMovimiento, MovimientoCaja, MovimientoCajaUpdate, getListMovimientosCajaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Loader2, Calendar, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MovimientosCaja() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { data: movimientos, isLoading } = useListMovimientosCaja();
  const createMovimiento = useCreateMovimientoCaja();

  const [formData, setFormData] = useState({
    tipo: TipoMovimiento.ajuste,
    monto: "",
    motivo: "",
    fecha: new Date().toISOString().split('T')[0]
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<MovimientoCajaUpdate>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const updateMovimiento = useUpdateMovimientoCaja();
  const deleteMovimiento = useDeleteMovimientoCaja();

  const openEdit = (mov: MovimientoCaja) => {
    setEditId(mov.id);
    setEditData({
      tipo: mov.tipo,
      monto: mov.monto,
      motivo: mov.motivo,
      fecha: mov.fecha.split('T')[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMovimiento.mutate({
      data: {
        tipo: formData.tipo,
        monto: Number(formData.monto),
        motivo: formData.motivo,
        fecha: formData.fecha
      }
    }, {
      onSuccess: () => {
        toast({ title: "Movimiento registrado" });
        setIsOpen(false);
        setFormData({ ...formData, monto: "", motivo: "" });
        queryClient.invalidateQueries({ queryKey: getListMovimientosCajaQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al registrar movimiento" });
      }
    });
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    deleteMovimiento.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "Movimiento eliminado" });
        setDeleteId(null);
        queryClient.invalidateQueries({ queryKey: getListMovimientosCajaQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al eliminar movimiento" });
      }
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    updateMovimiento.mutate({
      id: editId,
      data: editData,
    }, {
      onSuccess: () => {
        toast({ title: "Movimiento actualizado" });
        setEditId(null);
        setEditData({});
        queryClient.invalidateQueries({ queryKey: getListMovimientosCajaQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al actualizar movimiento" });
      }
    });
  };

  const getTipoIcon = (tipo: TipoMovimiento) => {
    switch(tipo) {
      case "ingreso": return <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><ArrowDownRight className="w-5 h-5" /></div>;
      case "egreso": return <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><ArrowUpRight className="w-5 h-5" /></div>;
      case "ajuste": return <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600"><ArrowRightLeft className="w-5 h-5" /></div>;
    }
  };

  const getMontoDisplay = (mov: any) => {
    if (mov.tipo === "ingreso") return <span className="text-emerald-600 font-semibold">+{formatCurrency(mov.monto)}</span>;
    if (mov.tipo === "egreso") return <span className="text-red-600 font-semibold">-{formatCurrency(mov.monto)}</span>;
    return <span className="text-slate-900 dark:text-slate-100 font-semibold">{formatCurrency(mov.monto)}</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Libro de Caja</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Historial de ingresos y egresos</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Registrar Movimiento Manual</DialogTitle>
                <DialogDescription>Añade capital, registra retiros u otros gastos no asociados a compras directas.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimiento</Label>
                  <Select value={formData.tipo} onValueChange={(val: any) => setFormData({...formData, tipo: val})}>
                    <SelectTrigger id="tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso (Aporte de capital)</SelectItem>
                      <SelectItem value="egreso">Egreso (Retiro, gasto)</SelectItem>
                      <SelectItem value="ajuste">Ajuste / Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto">Monto (CLP) <span className="text-red-500">*</span></Label>
                  <Input 
                    id="monto" type="number" required min="1" placeholder="0"
                    value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo / Concepto <span className="text-red-500">*</span></Label>
                  <Input 
                    id="motivo" required placeholder="Ej: Inyección de capital inicial"
                    value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha <span className="text-red-500">*</span></Label>
                  <Input 
                    id="fecha" type="date" required
                    value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMovimiento.isPending} className="bg-emerald-500">
                  {createMovimiento.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Registrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editId !== null} onOpenChange={(open) => { if (!open) { setEditId(null); setEditData({}); } }}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar Movimiento</DialogTitle>
              <DialogDescription>Actualiza los datos del movimiento manual.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de Movimiento</Label>
                <Select value={editData.tipo} onValueChange={(val: any) => setEditData({...editData, tipo: val})}>
                  <SelectTrigger id="edit-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso (Aporte de capital)</SelectItem>
                    <SelectItem value="egreso">Egreso (Retiro, gasto)</SelectItem>
                    <SelectItem value="ajuste">Ajuste / Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-monto">Monto (CLP)</Label>
                <Input
                  id="edit-monto" type="number" required min="1" placeholder="0"
                  value={editData.monto ?? ""} onChange={e => setEditData({...editData, monto: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motivo">Motivo / Concepto</Label>
                <Input
                  id="edit-motivo" required placeholder="Ej: Inyección de capital"
                  value={editData.motivo ?? ""} onChange={e => setEditData({...editData, motivo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Input
                  id="edit-fecha" type="date" required
                  value={editData.fecha ?? ""} onChange={e => setEditData({...editData, fecha: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditId(null); setEditData({}); }}>Cancelar</Button>
              <Button type="submit" disabled={updateMovimiento.isPending}>
                {updateMovimiento.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              Eliminar movimiento
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMovimiento.isPending}>
              {deleteMovimiento.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : movimientos?.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {movimientos?.map((mov) => (
                <div key={mov.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {getTipoIcon(mov.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {mov.motivo}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(mov.fecha)}</span>
                      {mov.equipoId && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 font-mono">Eq #{mov.equipoId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      {getMontoDisplay(mov)}
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{mov.tipo}</p>

                    </div>
                    {!mov.equipoId && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => openEdit(mov)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(mov.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
