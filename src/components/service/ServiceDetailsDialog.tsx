
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Truck, MapPin, Phone, Clock, FileEdit, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { Service } from "@/types/services";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceDetailsDialogProps {
  serviceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceDetailsDialog = ({ serviceId, isOpen, onClose }: ServiceDetailsDialogProps) => {
  const { data: service, isLoading } = useQuery({
    queryKey: ["service-details", serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .maybeSingle();

      if (error) throw error;
      return data as Service;
    },
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!service) return null;

  const isCollection = service.type === "coleta";
  const bgColor = isCollection ? "bg-[#F2FCE2]" : "bg-[#D3E4FD]";
  const Icon = isCollection ? ShoppingCart : Truck;
  const serviceType = isCollection ? "Coleta" : "Entrega";

  const getStatusIcon = () => {
    switch (service.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Concluído" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" aria-label="Cancelado" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" aria-label="Em andamento" />;
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          `${bgColor} border-0 animate-in fade-in-0 zoom-in-95`,
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[state=open]:duration-200"
        )}
        aria-labelledby="service-dialog-title"
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 bg-white rounded-full transition-transform hover:scale-105"
                aria-hidden="true"
              >
                <Icon className="h-6 w-6" />
              </div>
              <DialogTitle 
                id="service-dialog-title"
                className="text-lg"
              >
                {serviceType} #{service.service_id}
                <span className="sr-only">
                  {`Detalhes da ${serviceType.toLowerCase()} número ${service.service_id}`}
                </span>
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium capitalize">
                {service.status === "completed" && "Concluído"}
                {service.status === "cancelled" && "Cancelado"}
                {service.status === "in-transit" && "Em trânsito"}
                {service.status === "assigned" && "Atribuído"}
                {service.status === "not-assigned" && "Não atribuído"}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div 
            className="bg-white rounded-lg p-4 space-y-3 animate-in slide-in-from-left-1"
            role="region"
            aria-label="Informações do cliente"
          >
            <h3 className="font-medium text-base">{service.customer_name}</h3>
            
            <div className="flex items-center gap-2 text-gray-600 group hover:text-gray-900 transition-colors">
              <MapPin 
                className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" 
                aria-label="Endereço"
              />
              <span className="text-sm">{service.address}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 group hover:text-gray-900 transition-colors">
              <Phone 
                className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                aria-label="Telefone"
              />
              <span className="text-sm">{service.phone}</span>
            </div>

            {service.email && (
              <div className="flex items-center gap-2 text-gray-600 group hover:text-gray-900 transition-colors">
                <Mail 
                  className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                  aria-label="E-mail"
                />
                <span className="text-sm">{service.email}</span>
              </div>
            )}

            {service.time_window && (
              <div className="flex items-center gap-2 text-gray-600 group hover:text-gray-900 transition-colors">
                <Clock 
                  className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"
                  aria-label="Janela de tempo"
                />
                <span className="text-sm">{service.time_window}</span>
              </div>
            )}

            {service.observations && (
              <div className="flex items-start gap-2 text-gray-600 group hover:text-gray-900 transition-colors">
                <FileEdit 
                  className="h-4 w-4 mt-1 shrink-0 transition-transform group-hover:scale-110"
                  aria-label="Observações"
                />
                <span className="text-sm whitespace-pre-wrap">{service.observations}</span>
              </div>
            )}
          </div>

          <div 
            className="bg-white/50 rounded-lg p-4 space-y-2 animate-in slide-in-from-right-1"
            role="region"
            aria-label="Histórico de datas"
          >
            <div className="text-sm">
              <span className="text-gray-500">Criado em: </span>
              {formatDate(service.created_at)}
            </div>
            {service.updated_at && service.updated_at !== service.created_at && (
              <div className="text-sm">
                <span className="text-gray-500">Atualizado em: </span>
                {formatDate(service.updated_at)}
              </div>
            )}
            {service.completed_at && (
              <div className="text-sm">
                <span className="text-gray-500">Finalizado em: </span>
                {formatDate(service.completed_at)}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
