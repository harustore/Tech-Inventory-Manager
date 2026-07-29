import { db, persist, proveedoresTable, equiposTable, movimientosCajaTable, pagosCuotasTable } from "@workspace/db";

const prov1 = db.insert(proveedoresTable).values({ nombre: "Proveedor Uno", telefono: "123456789" }).returning().get();
const prov2 = db.insert(proveedoresTable).values({ nombre: "Proveedor Dos" }).returning().get();
const prov3 = db.insert(proveedoresTable).values({ nombre: "TechImport S.A." }).returning().get();

const eq1 = db.insert(equiposTable).values({
  categoria: "Celular", equipo: "iPhone 13", marca: "Apple", modelo: "A2634",
  estadoEquipoCondicion: "Usado - Excelente", estado: "en_stock", fechaCompra: "2026-07-01",
  proveedorId: prov1.id, formaPagoCompra: "Efectivo",
  precioCompra: 350, gastosExtra: 10, costoTotal: 360,
  sellerName: "Carlos García", sellerRut: "12.345.678-9", sellerContact: "+569 1234 5678",
  purchaseMeetingPlace: "Metro Los Héroes",
}).returning().get();

const eq2 = db.insert(equiposTable).values({
  categoria: "Celular", equipo: "Galaxy S24", marca: "Samsung", modelo: "SM-S921B",
  estadoEquipoCondicion: "Usado - Bueno", estado: "en_stock", fechaCompra: "2026-07-10",
  proveedorId: prov2.id, formaPagoCompra: "Efectivo",
  precioCompra: 500, gastosExtra: 0, costoTotal: 500,
  sellerName: "María López", sellerContact: "maria.lopez@gmail.com",
  purchaseMeetingPlace: "Portal Ñuñoa",
}).returning().get();

db.insert(equiposTable).values({
  categoria: "Otro", equipo: "iPad Air M2", marca: "Apple", modelo: "A2589",
  estadoEquipoCondicion: "Usado - Excelente", estado: "en_stock", fechaCompra: "2026-07-15",
  proveedorId: prov3.id, formaPagoCompra: "Efectivo",
  precioCompra: 600, gastosExtra: 20, costoTotal: 620,
});

const soldDate = "2026-07-20";
const eq4 = db.insert(equiposTable).values({
  categoria: "Celular", equipo: "Pixel 8 Pro", marca: "Google", modelo: "GC3VE",
  estadoEquipoCondicion: "Usado - Excelente", estado: "vendido", fechaCompra: "2026-07-05",
  proveedorId: prov1.id, formaPagoCompra: "Efectivo",
  precioCompra: 550, gastosExtra: 15, costoTotal: 565,
  fechaVenta: soldDate, plataformaVenta: "MercadoLibre", precioVenta: 750,
  ventaFormaPago: "Cuotas", ventaNumeroCuotas: 3, ventaCuotasPagadas: 1, gananciaNeta: 185,
  buyerName: "Pedro Ramírez", buyerRut: "23.456.789-0", buyerContact: "+569 9876 5432",
  meetingPlace: "Estación Central", buyerPaymentMethod: "Transferencia",
}).returning().get();

[{ tipo: "egreso", monto: 360,  motivo: "Compra: Apple iPhone 13",    fecha: "2026-07-01", equipoId: eq1.id },
 { tipo: "egreso", monto: 500,  motivo: "Compra: Samsung Galaxy S24", fecha: "2026-07-10", equipoId: eq2.id },
 { tipo: "egreso", monto: 565,  motivo: "Compra: Google Pixel 8 Pro", fecha: "2026-07-05", equipoId: eq4.id },
 { tipo: "ingreso", monto: 750, motivo: "Venta: Google Pixel 8 Pro",  fecha: soldDate,      equipoId: eq4.id },
].forEach((m) => db.insert(movimientosCajaTable).values(m));

db.insert(pagosCuotasTable).values({
  equipoId: eq4.id, monto: 250, fecha: soldDate,
});

persist();
console.log("Seed complete!");
