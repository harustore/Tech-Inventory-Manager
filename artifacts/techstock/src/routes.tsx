import { Show } from "@clerk/react";
import { Redirect } from "wouter";
import Dashboard from "./pages/dashboard";
import Inventario from "./pages/inventario";
import InventarioDetail from "./pages/inventario-detail";
import InventarioNuevo from "./pages/inventario-nuevo";
import Proveedores from "./pages/proveedores";
import MovimientosCaja from "./pages/movimientos-caja";
import Recomendaciones from "./pages/recomendaciones";
import Layout from "./components/layout";

export default function AppRoutes() {
  return (
    <Layout>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
      <Show when="signed-in">
        <Dashboard />
      </Show>
    </Layout>
  );
}
