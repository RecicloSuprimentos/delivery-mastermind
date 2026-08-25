
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SendToBack, PackageCheck, MapPin, Phone, Clock, FileEdit, Mail, Camera, CheckCircle2 } from "lucide-react";
import type { Service } from "@/types/services";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ServiceDetailsDialogProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceDetailsDialog = ({ service, isOpen, onClose }: ServiceDetailsDialogProps) => {
  if (!service) return null;

  const isCollection = service.type === "coleta";
  const bgColor = isCollection ? "bg-[#F2FCE2]" : "bg-[#D3E4FD]";
  const Icon = isCollection ? SendToBack : PackageCheck;

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  // Dados do comprovante Lalamove (gravados pelo webhook ao confirmar entrega)
  const completionDetails = service.completion_details as {
    completedAt?: string;
    podPhotoUrl?: string;
    observations?: string;
  } | undefined;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${bgColor} border-0`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <Icon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg">
              {service.type.toUpperCase()} #{service.service_id}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-base">{service.customer_name}</h3>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{service.address}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="text-sm">{service.phone}</span>
            </div>

            {service.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-sm">{service.email}</span>
              </div>
            )}

            {service.time_window && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm">{service.time_window}</span>
              </div>
            )}

            {service.observations && (
              <div className="flex items-start gap-2 text-gray-600">
                <FileEdit className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-sm whitespace-pre-wrap">{service.observations}</span>
              </div>
            )}
          </div>

          <div className="bg-white/50 rounded-lg p-4 space-y-2">
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

          {/* Comprovante de entrega Lalamove */}
          {service.status === 'completed' && completionDetails && (
            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Entrega Confirmada</span>
              </div>

              {completionDetails.completedAt && (
                <div className="text-sm text-gray-600">
                  <span className="text-gray-500">Horário: </span>
                  {formatDate(completionDetails.completedAt)}
                </div>
              )}

              {completionDetails.observations && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileEdit className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-sm">{completionDetails.observations}</span>
                </div>
              )}

              {completionDetails.podPhotoUrl && (
                <a
                  href={completionDetails.podPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Camera className="h-4 w-4" />
                  Ver foto comprovante
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
