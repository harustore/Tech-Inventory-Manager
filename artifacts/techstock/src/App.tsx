import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, Show, useClerk, useAuth } from '@clerk/react';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { shadcn } from '@clerk/themes';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

import PublicLanding from "./pages/public-landing";
import Dashboard from "./pages/dashboard";
import Inventario from "./pages/inventario";
import InventarioDetail from "./pages/inventario-detail";
import InventarioNuevo from "./pages/inventario-nuevo";
import Proveedores from "./pages/proveedores";
import MovimientosCaja from "./pages/movimientos-caja";
import Recomendaciones from "./pages/recomendaciones";
import Deudores from "./pages/deudores";
import Layout from "./components/layout";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(158 64% 52%)", // Emerald 500
    colorForeground: "hsl(222 47% 11%)", // slate-900
    colorMutedForeground: "hsl(215 16% 47%)", // slate-500
    colorDanger: "hsl(350 89% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)", // slate-200
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-slate-100",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900 font-bold",
    headerSubtitle: "text-slate-500",
    socialButtonsBlockButtonText: "text-slate-700 font-medium",
    formFieldLabel: "text-slate-700 font-medium",
    footerActionLink: "text-emerald-600 hover:text-emerald-700 font-medium",
    footerActionText: "text-slate-500",
    dividerText: "text-slate-400 text-xs font-medium uppercase",
    identityPreviewEditButton: "text-emerald-600 hover:text-emerald-700",
    formFieldSuccessText: "text-emerald-600",
    alertText: "text-slate-700",
    logoBox: "mb-6",
    logoImage: "h-10 mx-auto",
    socialButtonsBlockButton: "border-slate-200 hover:bg-slate-50 transition-colors",
    formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors shadow-sm",
    formFieldInput: "border-slate-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
    footerAction: "bg-slate-50 py-4 px-8 border-t border-slate-100 mt-2",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500",
    formFieldRow: "mb-4",
    main: "p-8",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} />
    </div>
  );
}

const queryClient = new QueryClient();

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientInstance = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClientInstance.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClientInstance]);

  return null;
}

function ClerkAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <PublicLanding />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: any }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bienvenido de nuevo",
            subtitle: "Inicia sesión en TechStock",
          },
        },
        signUp: {
          start: {
            title: "Crea tu cuenta",
            subtitle: "Comienza a organizar tu inventario",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ClerkAuthBridge />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/inventario" component={() => <ProtectedRoute component={Inventario} />} />
          <Route path="/inventario/nuevo" component={() => <ProtectedRoute component={InventarioNuevo} />} />
          <Route path="/inventario/:id" component={() => <ProtectedRoute component={InventarioDetail} />} />
          <Route path="/proveedores" component={() => <ProtectedRoute component={Proveedores} />} />
          <Route path="/movimientos-caja" component={() => <ProtectedRoute component={MovimientosCaja} />} />
          <Route path="/recomendaciones" component={() => <ProtectedRoute component={Recomendaciones} />} />
          <Route path="/deudores" component={() => <ProtectedRoute component={Deudores} />} />
          <Route>
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-2xl font-bold">404 - No encontrado</h1>
            </div>
          </Route>
        </Switch>
        <Toaster />
      </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
