import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AgentProtectedRoute } from "@/components/auth/AgentProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NewServicePage from "./pages/NewServicePage";
import SettingsPage from "./pages/Settings";
import RoutesPage from "./pages/RoutesPage";
import CreateRoutePage from "./pages/CreateRoutePage";
import AgentPage from "./pages/AgentPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para carregar as configurações e o Google Maps
const AppContent = () => {
  const { data: settings } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Se não houver configurações ou chave do Google Maps, não carrega o script
  if (!settings?.google_maps_key) {
    console.warn("Google Maps API key not found in settings");
    return null;
  }

  return (
    <LoadScript googleMapsApiKey={settings.google_maps_key} libraries={["places"]}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-service"
            element={
              <ProtectedRoute>
                <NewServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-service/:id"
            element={
              <ProtectedRoute>
                <NewServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes"
            element={
              <ProtectedRoute>
                <RoutesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routes/new"
            element={
              <ProtectedRoute>
                <CreateRoutePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent"
            element={
              <AgentProtectedRoute>
                <AgentPage />
              </AgentProtectedRoute>
            }
          />
        </Routes>
      </TooltipProvider>
    </LoadScript>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;