import { Button } from "@/components/ui/button";

interface ServiceFormActionsProps {
  onClose?: () => void;
}

const ServiceFormActions = ({ onClose }: ServiceFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" className="bg-success hover:bg-success/90">
        Criar Serviço
      </Button>
    </div>
  );
};

export default ServiceFormActions;