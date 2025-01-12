import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ServiceTypeSection } from "./service-form/ServiceTypeSection";
import { CustomerInfoSection } from "./service-form/CustomerInfoSection";
import { AddressSection } from "./service-form/AddressSection";
import { AdditionalInfoSection } from "./service-form/AdditionalInfoSection";
import { ServiceFormValues } from "./service-form/types";

const serviceSchema = z.object({
  code: z.string().min(1, "ID do serviço é obrigatório"),
  type: z.string(),
  customer: z.string().min(1, "Nome do cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  addressComplement: z.string().optional(),
  email: z.string().email("E-mail inválido").optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  timeWindow: z.string().optional(),
  notes: z.string().optional(),
});

interface ServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceForm = ({ onClose, onSuccess }: ServiceFormProps) => {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: "delivery",
      code: "",
      customer: "",
      address: "",
      addressComplement: "",
      email: "",
      phone: "",
      timeWindow: "",
      notes: "",
    },
  });

  const handleAddService = async (values: ServiceFormValues) => {
    try {
      const { error } = await supabase
        .from('services')
        .insert([{
          code: values.code,
          customer: values.customer,
          address: values.address,
          phone: values.phone,
          status: 'not-assigned',
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      onSuccess();
      toast.success("Serviço adicionado com sucesso!");
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error("Erro ao adicionar serviço");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Novo Serviço</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados para criar um novo serviço
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddService)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <ServiceTypeSection form={form} />
              <CustomerInfoSection form={form} />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <AddressSection form={form} />
              <AdditionalInfoSection form={form} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" className="bg-success hover:bg-success/90 text-white">
              Adicionar Serviço
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};