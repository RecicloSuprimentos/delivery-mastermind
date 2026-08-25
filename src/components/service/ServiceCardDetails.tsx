import { MapPin, Phone, Clock, FileEdit, User, Check, X, CreditCard, Package, Camera } from "lucide-react";

interface ServiceCardDetailsProps {
  address: string;
  phone: string;
  timeWindow?: string;
  observations?: string;
  isExpanded: boolean;
  status?: string;
  agentName?: string;
  completionDetails?: {
    responsibleName?: string;
    collectedItems?: string;
    observations?: string;
    completedAt?: string;
    paymentMethod?: string;
    podPhotoUrl?: string;
  };
  failureDetails?: {
    reason: string;
    observations?: string;
    completedAt: string;
  };
}

export const ServiceCardDetails = ({
  address,
  phone,
  timeWindow,
  observations,
  isExpanded,
  status,
  agentName,
  completionDetails,
  failureDetails
}: ServiceCardDetailsProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 mb-1">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="text-sm">{address}</span>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <Phone className="h-4 w-4 shrink-0" />
        <span className="text-sm">{phone}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 border-t pt-2">
          {status !== "not-assigned" && agentName && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4 shrink-0" />
              <span className="text-sm">Agente: {agentName}</span>
            </div>
          )}
          
          {timeWindow && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-sm">{timeWindow}</span>
            </div>
          )}
          
          {observations && (
            <div className="flex items-start gap-2 text-gray-600">
              <FileEdit className="h-4 w-4 mt-1 shrink-0" />
              <span className="text-sm">{observations}</span>
            </div>
          )}

          {/* Detalhes de conclusão */}
          {completionDetails && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Concluído em {formatDate(completionDetails.completedAt)}
                </span>
              </div>
              
              {completionDetails.responsibleName && (
                <div className="text-sm text-gray-600">
                  Responsável: {completionDetails.responsibleName}
                </div>
              )}

              {completionDetails.paymentMethod && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    Pagamento: {completionDetails.paymentMethod}
                  </span>
                </div>
              )}

              {completionDetails.collectedItems && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-sm">
                    Itens: {completionDetails.collectedItems}
                  </span>
                </div>
              )}

              {completionDetails.observations && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileEdit className="h-4 w-4 mt-1 shrink-0" />
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
                  <Camera className="h-4 w-4 shrink-0" />
                  Ver foto comprovante
                </a>
              )}
            </div>
          )}

          {/* Detalhes de falha */}
          {failureDetails && (
            <div className="mt-3 space-y-2 border-t pt-2">
              <div className="flex items-center gap-2 text-red-600">
                <X className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Cancelado em {formatDate(failureDetails.completedAt)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                Motivo: {failureDetails.reason}
              </div>

              {failureDetails.observations && (
                <div className="flex items-start gap-2 text-gray-600">
                  <FileEdit className="h-4 w-4 mt-1 shrink-0" />
                  <span className="text-sm">{failureDetails.observations}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
