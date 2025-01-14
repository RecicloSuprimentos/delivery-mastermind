import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadScript } from "@react-google-maps/api";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NewServicePage from "./pages/NewServicePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LoadScript googleMapsApiKey="AIzaSyB30rumsKJs3dV_NZ8N0khyf-n4yWDjQKI" libraries={["places"]}>
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
            </Routes>
          </TooltipProvider>
        </LoadScript>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;