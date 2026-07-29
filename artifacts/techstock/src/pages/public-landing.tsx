import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PublicLanding() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/logo.svg`} alt="TechStock Logo" className="w-8 h-8" />
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xl tracking-tight">TechStock</span>
        </div>
        <div className="flex gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center">
            Iniciar sesión
          </Link>
          <Link href="/sign-up" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600 h-9 px-4 py-2">
            Registrarse
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-800 font-medium mb-4">
            Inventario y Caja para Resellers
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-balance">
            El control total de tu negocio tecnológico.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Abandona las hojas de Excel. TechStock Inventario está diseñado específicamente para registrar compras, ventas, y ganancias de celulares, PCs, consolas y más, con precisión y confianza.
          </p>
          <div className="pt-8">
            <Link href="/sign-up" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-500 text-white hover:bg-emerald-600 h-12 px-8 py-3 shadow-sm hover:shadow-md">
              Comenzar a usar TechStock
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-left">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">Inventario Detallado</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Registra cada equipo con su condición, costo, IMEIs y estado de batería. Encuentra lo que buscas al instante.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">Flujo de Caja</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Sigue cada ingreso, egreso y cálculo de ganancia neta. Conoce cuánto capital real tiene el negocio hoy.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg mb-2">Recomendaciones</h3>
            <p className="text-slate-600 text-sm leading-relaxed">El sistema analiza tu historial de ventas para sugerirte qué equipos volver a comprar y a qué precios.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
