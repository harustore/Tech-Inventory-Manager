import { useMemo, useState } from "react";
import {
  useListMovimientosCaja,
  useCreateMovimientoCaja,
  useUpdateMovimientoCaja,
  useDeleteMovimientoCaja,
  TipoMovimiento,
  MovimientoCaja,
  MovimientoCajaUpdate,
  getListMovimientosCajaQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Loader2,
  Calendar,
  Pencil,
  Trash2,
  Wallet,
  Coins,
  TrendingDown,
} from "lucide-react";
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

function typeMeta(tipo: TipoMovimiento) {
  switch (tipo) {
    case "ingreso":
      return {
        label: "Ingreso",
        tone: "text-cyan-700 dark:text-cyan-300",
        badge: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
        icon: ArrowDownRight,
        iconBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
      };
    case "egreso":
      return {
        label: "Egreso",
        tone: "text-red-700 dark:text-red-300",
        badge: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
        icon: ArrowUpRight,
        iconBg: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300",
      };
    case "ajuste":
    default:
      return {
        label: "Ajuste",
        tone: "text-slate-700 dark:text-slate-300",
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        icon: ArrowRightLeft,
        iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      };
  }
}

export default function MovimientosCaja() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { data: movimientos, isLoading } = useListMovimientosCaja();
  const createMovimiento = useCreateMovimientoCaja();
  const updateMovimiento = useUpdateMovimientoCaja();
  const deleteMovimiento = useDeleteMovimientoCaja();

  const [formData, setFormData] = useState({
    tipo: TipoMovimiento.ajuste,
    monto: "",
    motivo: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<MovimientoCajaUpdate>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totals = useMemo(() => {
    const list = movimientos ?? [];
    const ingresos = list.filter((m) => m.tipo === "ingreso").reduce((sum, m) => sum + m.monto, 0);
    const egresos = list.filter((m) => m.tipo === "egreso").reduce((sum, m) => sum + m.monto, 0);
    const ajustes = list.filter((m) => m.tipo === "ajuste").reduce((sum, m) => sum + m.monto, 0);
    return {
      ingresos,
      egresos,
      ajustes,
      neto: ingresos - egresos + ajustes,
      total: list.length,
    };
  }, [movimientos]);

  const openEdit = (mov: MovimientoCaja) => {
    setEditId(mov.id);
    setEditData({
      tipo: mov.tipo,
      monto: mov.monto,
      motivo: mov.motivo,
      fecha: mov.fecha.split("T")[0],
    });
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListMovimientosCajaQueryKey() });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMovimiento.mutate(
      {
        data: {
          tipo: formData.tipo,
          monto: Number(formData.monto),
          motivo: formData.motivo,
          fecha: formData.fecha,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Movimiento registrado" });
          setIsOpen(false);
          setFormData({ ...formData, monto: "", motivo: "" });
          invalidate();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error al registrar movimiento" });
        },
      },
    );
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    deleteMovimiento.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Movimiento eliminado" });
          setDeleteId(null);
          invalidate();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error al eliminar movimiento" });
        },
      },
    );
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    updateMovimiento.mutate(
      {
        id: editId,
        data: editData,
      },
      {
        onSuccess: () => {
          toast({ title: "Movimiento actualizado" });
          setEditId(null);
          setEditData({});
          invalidate();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error al actualizar movimiento" });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-cyan-50 shadow-sm dark:border-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.08),transparent_26%)]" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                Caja activa
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-4xl">
                  Libro de caja con lectura rápida y contraste fuerte.
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  Registra ingresos, egresos y ajustes manuales en una vista más clara para seguir el flujo de dinero sin ruido.
                </p>
              </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-500 text-white shadow-sm hover:bg-cyan-600 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo movimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Registrar movimiento manual</DialogTitle>
                    <DialogDescription>
                      Añade capital, registra retiros u otros gastos no asociados a compras directas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de movimiento</Label>
                      <Select value={formData.tipo} onValueChange={(val: any) => setFormData({ ...formData, tipo: val })}>
                        <SelectTrigger id="tipo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ingreso">Ingreso (aporte de capital)</SelectItem>
                          <SelectItem value="egreso">Egreso (retiro, gasto)</SelectItem>
                          <SelectItem value="ajuste">Ajuste / Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monto">
                        Monto (CLP) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="monto"
                        type="number"
                        required
                        min="1"
                        placeholder="0"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motivo">
                        Motivo / Concepto <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="motivo"
                        required
                        placeholder="Ej: Inyección de capital inicial"
                        value={formData.motivo}
                        onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha">
                        Fecha <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fecha"
                        type="date"
                        required
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMovimiento.isPending} className="bg-cyan-500 hover:bg-cyan-600">
                      {createMovimiento.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo neto</p>
                  <Wallet className="h-5 w-5 text-cyan-500" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  {formatCurrency(totals.neto)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ingresos - egresos + ajustes</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ingresos</p>
                  <ArrowDownRight className="h-5 w-5 text-cyan-500" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  {formatCurrency(totals.ingresos)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">dinero que entra a caja</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Egresos</p>
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  {formatCurrency(totals.egresos)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">salidas registradas</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-white/85 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Movimientos</p>
                  <Coins className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  {totals.total}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">registros en total</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Dialog open={editId !== null} onOpenChange={(open) => { if (!open) { setEditId(null); setEditData({}); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Editar movimiento</DialogTitle>
              <DialogDescription>Actualiza los datos del movimiento manual.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de movimiento</Label>
                <Select value={editData.tipo} onValueChange={(val: any) => setEditData({ ...editData, tipo: val })}>
                  <SelectTrigger id="edit-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso (aporte de capital)</SelectItem>
                    <SelectItem value="egreso">Egreso (retiro, gasto)</SelectItem>
                    <SelectItem value="ajuste">Ajuste / Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-monto">Monto (CLP)</Label>
                <Input
                  id="edit-monto"
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={editData.monto ?? ""}
                  onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-motivo">Motivo / Concepto</Label>
                <Input
                  id="edit-motivo"
                  required
                  placeholder="Ej: Inyección de capital"
                  value={editData.motivo ?? ""}
                  onChange={(e) => setEditData({ ...editData, motivo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Input
                  id="edit-fecha"
                  type="date"
                  required
                  value={editData.fecha ?? ""}
                  onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditId(null); setEditData({}); }}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMovimiento.isPending} className="bg-cyan-500 hover:bg-cyan-600">
                {updateMovimiento.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Eliminar movimiento
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteMovimiento.isPending}>
              {deleteMovimiento.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="overflow-hidden border-slate-200 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Movimientos recientes</CardTitle>
          <CardDescription>Historial detallado de caja manual</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
                  <Skeleton className="h-11 w-11 rounded-full" />
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
              {movimientos?.map((mov) => {
                const meta = typeMeta(mov.tipo);
                const Icon = meta.icon;
                return (
                  <div
                    key={mov.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 sm:p-5"
                  >
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", meta.iconBg)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-slate-950 dark:text-slate-100">{mov.motivo}</p>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider", meta.badge)}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(mov.fecha)}
                        </span>
                        {mov.equipoId && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Eq #{mov.equipoId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-right">
                      <div>
                        {mov.tipo === "ingreso" ? (
                          <span className="font-semibold text-cyan-700 dark:text-cyan-300">+{formatCurrency(mov.monto)}</span>
                        ) : mov.tipo === "egreso" ? (
                          <span className="font-semibold text-red-600">-{formatCurrency(mov.monto)}</span>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(mov.monto)}</span>
                        )}
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">{meta.label}</p>
                      </div>
                      {!mov.equipoId && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-cyan-600"
                            onClick={() => openEdit(mov)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                            onClick={() => setDeleteId(mov.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
