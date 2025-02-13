
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, Truck, MapPin, Phone, Clock, FileEdit, Mail } from "lucide-react";
import type { Service } from "@/types/services";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ServiceDetailsDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceDetailsDialog = ({ service, isOpen, onClose }: ServiceDetailsDialogProps) => {
  if (!service) return null;

  const isCollection = service.type === "coleta";
  const bgColor = isCollection ? "bg-[#F2FCE2]" : "bg-[#D3E4FD]";
  const Icon = isCollection ? ShoppingCart : Truck;
  const serviceType = isCollection ? "Coleta" : "Entrega";

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
