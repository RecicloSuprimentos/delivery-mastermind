import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useGoogleMaps = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["system_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("google_maps_key")
        .single();

      if (error) {
        console.error("Erro ao buscar configurações:", error);
        throw error;
      }

      console.log("Google Maps Key:", data?.google_maps_key ? "Existe" : "Não existe");
      return data;
    },
  });

  const loadGoogleMapsScript = async (apiKey: string): Promise<void> => {
    if (window.google) {
      console.log("Google Maps já está carregado");
      return;
    }

    console.log("Iniciando carregamento do Google Maps");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log("Google Maps carregado com sucesso");
        resolve();
      };
      
      script.onerror = () => {
        console.error("Erro ao carregar o Google Maps");
        reject(new Error("Erro ao carregar o Google Maps"));
      };

      document.head.appendChild(script);
    });
  };

  const initializeGoogleMaps = async () => {
    if (!settings?.google_maps_key) {
      console.error("Chave do Google Maps não encontrada");
      toast.error("Erro: Chave do Google Maps não configurada");
      return;
    }

    try {
      setIsLoading(true);
      await loadGoogleMapsScript(settings.google_maps_key);
    } catch (error) {
      console.error("Erro ao carregar Google Maps:", error);
      toast.error("Erro ao carregar serviço de busca de endereços");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    initializeGoogleMaps
  };
};