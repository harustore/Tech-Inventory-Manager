import { useState } from "react";
import { useListProveedores, useCreateProveedor, useDeleteProveedor, getListProveedoresQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2, Mail, Phone, MapPin, Building2, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

export default function Proveedores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: proveedores, isLoading } = useListProveedores();
  const createProveedor = useCreateProveedor();
  const deleteProveedor = useDeleteProveedor();

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    comentarios: ""
  });

  const filteredProveedores = proveedores?.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.telefono && p.telefono.includes(search))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProveedor.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Proveedor agregado" });
        setIsOpen(false);
        setFormData({ nombre: "", telefono: "", email: "", direccion: "", comentarios: "" });
        queryClient.invalidateQueries({ queryKey: getListProveedoresQueryKey() });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error al agregar proveedor" });
      }
    });
  };

  const handleDelete = (id: number) => {
    if(!confirm("¿Eliminar proveedor?")) return;
    deleteProveedor.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Proveedor eliminado" });
        queryClient.invalidateQueries({ queryKey: getListProveedoresQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Proveedores</h1>
          <p className="text-slate-500 mt-1">Contactos y fuentes de compra</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Agregar Proveedor</DialogTitle>
                <DialogDescription>Registra un nuevo contacto para tus compras.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                  <Input 
                    id="nombre" required placeholder="Nombre o Razón Social"
                    value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input 
                      id="telefono" placeholder="Ej: +54 9 11..."
                      value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" type="email" placeholder="correo@ejemplo.com"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección / Zona</Label>
                  <Input 
                    id="direccion" placeholder="Ej: Microcentro, Galería..."
                    value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentarios">Notas</Label>
                  <Textarea 
                    id="comentarios" placeholder="Horarios, condiciones especiales..." className="resize-none"
                    value={formData.comentarios} onChange={e => setFormData({...formData, comentarios: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createProveedor.isPending} className="bg-emerald-500">
                  {createProveedor.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar proveedores..." 
          className="pl-9 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredProveedores?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
          <Building2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No hay proveedores</h3>
          <p className="mt-1 text-sm text-slate-500">Añade tu primer proveedor para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores?.map((proveedor) => (
            <Card key={proveedor.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base font-semibold leading-tight">{proveedor.nombre}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 -mt-2 -mr-2" onClick={() => handleDelete(proveedor.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  {proveedor.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{proveedor.telefono}</span>
                    </div>
                  )}
                  {proveedor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{proveedor.email}</span>
                    </div>
                  )}
                  {proveedor.direccion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{proveedor.direccion}</span>
                    </div>
                  )}
                  {!proveedor.telefono && !proveedor.email && !proveedor.direccion && (
                    <p className="text-slate-400 italic">Sin datos de contacto</p>
                  )}
                </div>
                {proveedor.comentarios && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 line-clamp-2">{proveedor.comentarios}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
