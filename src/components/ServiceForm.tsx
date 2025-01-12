import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { ServiceTypeSection } from "./service-form/ServiceTypeSection";
import { CustomerInfoSection } from "./service-form/CustomerInfoSection";
import { AddressSection } from "./service-form/AddressSection";
import { AdditionalInfoSection } from "./service-form/AdditionalInfoSection";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { ServiceFormValues } from "./service-form/types";

const formSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  customer: z.string().min(1, "Cliente é obrigatório"),
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "",
      customer: "",
      address: "",
      addressComplement: "",
      email: "",
      phone: "",
      timeWindow: "",
      notes: "",
    },
  });

  useEffect(() => {
    const generateCode = () => {
      const random = Math.floor(100000 + Math.random() * 900000);
      form.setValue("code", random.toString());
    };
    generateCode();
  }, [form]);

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar serviço",
          description: "Usuário não autenticado.",
        });
        return;
      }

      const { error } = await supabase.from("services").insert({
        code: values.code,
        customer: values.customer,
        address: values.address,
        phone: values.phone,
        status: "not-assigned",
        user_id: user.id,
        notes: values.notes,
        time_window: values.timeWindow,
      });

      if (error) throw error;

      toast({
        title: "Serviço cadastrado com sucesso!",
        description: `O serviço ${values.code} foi cadastrado.`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar serviço",
        description: "Ocorreu um erro ao tentar cadastrar o serviço.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-[85vh] w-[135%] -ml-[17.5%]">
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <ServiceTypeSection form={form} />
              <CustomerInfoSection form={form} />
            </div>
            <div className="space-y-4">
              <AddressSection form={form} />
              <AdditionalInfoSection form={form} />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar</Button>
          </div>
        </div>
      </form>
    </Form>
  );
};