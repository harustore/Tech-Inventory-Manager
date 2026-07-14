import { useState } from "react";
import { useCreateEquipo, Categoria, EstadoEquipoCondicion, FormaPago, useListProveedores } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function InventarioNuevo() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createEquipo = useCreateEquipo();
  const { data: proveedores } = useListProveedores();
  
  const [formData, setFormData] = useState({
    categoria: Categoria.Celular,
    equipo: "",
    marca: "",
    modelo: "",
    bateriaPct: "",
    imeiSerial: "",
    estadoEquipoCondicion: EstadoEquipoCondicion["Usado_-_Excelente"],
    fechaCompra: new Date().toISOString().split('T')[0],
    proveedorId: "none",
    formaPagoCompra: FormaPago.Efectivo,
    precioCompra: "",
    gastosExtra: "0",
    comentarios: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createEquipo.mutate({
      data: {
        ...formData,
        bateriaPct: formData.bateriaPct ? Number(formData.bateriaPct) : undefined,
        proveedorId: formData.proveedorId !== "none" ? Number(formData.proveedorId) : undefined,
        precioCompra: Number(formData.precioCompra),
        gastosExtra: Number(formData.gastosExtra)
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Equipo registrado",
          description: "La compra se registró correctamente.",
        });
        setLocation(`/inventario/${data.id}`);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error al registrar",
          description: "Verifica los datos e intenta nuevamente.",
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => setLocation("/inventario")} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Registrar Compra</h1>
          <p className="text-slate-500 text-sm">Ingresa un nuevo equipo al inventario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle className="text-lg">Detalles del Equipo</CardTitle>
            <CardDescription>Información general y técnica</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría <span className="text-red-500">*</span></Label>
                <Select value={formData.categoria} onValueChange={(val: any) => setFormData({...formData, categoria: val})}>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Categoria).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipo">Nombre / Descripción <span className="text-red-500">*</span></Label>
                <Input 
                  id="equipo" 
                  required
                  placeholder="Ej: iPhone 13 Pro 128GB Azul"
                  value={formData.equipo}
                  onChange={e => setFormData({...formData, equipo: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca <span className="text-red-500">*</span></Label>
                <Input 
                  id="marca" 
                  required
                  placeholder="Ej: Apple"
                  value={formData.marca}
                  onChange={e => setFormData({...formData, marca: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo <span className="text-red-500">*</span></Label>
                <Input 
                  id="modelo" 
                  required
                  placeholder="Ej: iPhone 13 Pro"
                  value={formData.modelo}
                  onChange={e => setFormData({...formData, modelo: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoEquipoCondicion">Condición <span className="text-red-500">*</span></Label>
                <Select value={formData.estadoEquipoCondicion} onValueChange={(val: any) => setFormData({...formData, estadoEquipoCondicion: val})}>
                  <SelectTrigger id="estadoEquipoCondicion">
                    <SelectValue placeholder="Selecciona la condición" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EstadoEquipoCondicion).map(est => (
                      <SelectItem key={est} value={est}>{est}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bateriaPct">Salud de Batería (%)</Label>
                <Input 
                  id="bateriaPct" 
                  type="number" 
                  min="0" max="100"
                  placeholder="Ej: 85"
                  value={formData.bateriaPct}
                  onChange={e => setFormData({...formData, bateriaPct: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imeiSerial">IMEI o Número de Serie</Label>
                <Input 
                  id="imeiSerial" 
                  placeholder="Ingresa el IMEI (celulares) o Serie (otros equipos)"
                  value={formData.imeiSerial}
                  onChange={e => setFormData({...formData, imeiSerial: e.target.value})}
                />
              </div>
            </div>

            <div className="my-8 border-t border-slate-100"></div>
            
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Datos de Compra</h3>
              <p className="text-sm text-slate-500">Información financiera y proveedor</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fechaCompra">Fecha de Compra <span className="text-red-500">*</span></Label>
                <Input 
                  id="fechaCompra" 
                  type="date"
                  required
                  value={formData.fechaCompra}
                  onChange={e => setFormData({...formData, fechaCompra: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedorId">¿A quién se lo compraste?</Label>
                <Select value={formData.proveedorId} onValueChange={(val) => setFormData({...formData, proveedorId: val})}>
                  <SelectTrigger id="proveedorId">
                    <SelectValue placeholder="Sin contacto registrado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Sin contacto registrado --</SelectItem>
                    {proveedores?.map(prov => (
                      <SelectItem key={prov.id} value={prov.id.toString()}>{prov.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">Sirve para poder ubicarlo si el equipo presenta fallas.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagoCompra">Forma de Pago <span className="text-red-500">*</span></Label>
                <Select value={formData.formaPagoCompra} onValueChange={(val: any) => setFormData({...formData, formaPagoCompra: val})}>
                  <SelectTrigger id="formaPagoCompra">
                    <SelectValue placeholder="Selecciona forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FormaPago).map(fp => (
                      <SelectItem key={fp} value={fp}>{fp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioCompra">Precio de Compra (ARS) <span className="text-red-500">*</span></Label>
                <Input 
                  id="precioCompra" 
                  type="number" 
                  required
                  min="0"
                  placeholder="0"
                  value={formData.precioCompra}
                  onChange={e => setFormData({...formData, precioCompra: e.target.value})}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gastosExtra">Gastos Extra (Reparaciones, envíos, etc) (ARS)</Label>
                <Input 
                  id="gastosExtra" 
                  type="number" 
                  min="0"
                  placeholder="0"
                  value={formData.gastosExtra}
                  onChange={e => setFormData({...formData, gastosExtra: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">Costo total: ARS ${(Number(formData.precioCompra) || 0) + (Number(formData.gastosExtra) || 0)}</p>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="comentarios">Comentarios u observaciones</Label>
                <Textarea 
                  id="comentarios" 
                  placeholder="Detalles sobre el estado, fallas, accesorios incluidos..."
                  value={formData.comentarios}
                  onChange={e => setFormData({...formData, comentarios: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

          </CardContent>
          <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 rounded-b-xl">
            <Button type="button" variant="outline" onClick={() => setLocation("/inventario")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createEquipo.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {createEquipo.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar y Registrar
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
