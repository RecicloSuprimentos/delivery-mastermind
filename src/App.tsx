import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AgentLogin from "./pages/AgentLogin";
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
          <Route path="/agent-login" element={<AgentLogin />} />
          <Route path="/" element={<Index />} />
          <Route path="/new-service" element={<NewServicePage />} />
          <Route path="/new-service/:id" element={<NewServicePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/new" element={<CreateRoutePage />} />
          <Route path="/agent" element={<AgentPage />} />
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