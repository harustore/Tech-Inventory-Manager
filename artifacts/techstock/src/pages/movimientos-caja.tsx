import { useState } from "react";
import { useListMovimientosCaja, useCreateMovimientoCaja, TipoMovimiento, getListMovimientosCajaQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Loader2, Calendar } from "lucide-react";
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

  const getTipoIcon = (tipo: TipoMovimiento) => {
    switch(tipo) {
      case "ingreso": return <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><ArrowDownRight className="w-5 h-5" /></div>;
      case "egreso": return <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600"><ArrowUpRight className="w-5 h-5" /></div>;
      case "ajuste": return <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><ArrowRightLeft className="w-5 h-5" /></div>;
    }
  };

  const getMontoDisplay = (mov: any) => {
    if (mov.tipo === "ingreso") return <span className="text-emerald-600 font-semibold">+{formatCurrency(mov.monto)}</span>;
    if (mov.tipo === "egreso") return <span className="text-red-600 font-semibold">-{formatCurrency(mov.monto)}</span>;
    return <span className="text-slate-900 font-semibold">{formatCurrency(mov.monto)}</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Libro de Caja</h1>
          <p className="text-slate-500 mt-1">Historial de ingresos y egresos</p>
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
                  <Label htmlFor="monto">Monto (ARS) <span className="text-red-500">*</span></Label>
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

      <Card className="border-slate-200 shadow-sm overflow-hidden">
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
            <div className="p-12 text-center text-slate-500">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {movimientos?.map((mov) => (
                <div key={mov.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  {getTipoIcon(mov.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {mov.motivo}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(mov.fecha)}</span>
                      {mov.equipoId && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">Eq #{mov.equipoId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {getMontoDisplay(mov)}
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{mov.tipo}</p>
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
