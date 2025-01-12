import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const serviceSchema = z.object({
  code: z.string().min(1, "ID do serviço é obrigatório"),
  type: z.string(),
  customer: z.string().min(1, "Nome do cliente é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  timeWindow: z.string().optional(),
  notes: z.string().optional(),
});

interface ServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ServiceForm = ({ onClose, onSuccess }: ServiceFormProps) => {
  const form = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: "delivery",
      code: "",
      customer: "",
      address: "",
      phone: "",
      timeWindow: "",
      notes: "",
    },
  });

  const handleAddService = async (values: z.infer<typeof serviceSchema>) => {
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
          <div className="grid gap-6">
            <div className="p-4 bg-soft-blue rounded-lg">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Tipo de Serviço</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="delivery">Entrega</SelectItem>
                        <SelectItem value="pickup">Coleta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 p-4 bg-soft-gray rounded-lg">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">ID do Serviço *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o ID" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Nome do Cliente *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o nome do cliente" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Telefone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o telefone" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-soft-green rounded-lg">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Endereço *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o endereço completo" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                    <div className="h-[200px] bg-gray-100 rounded-lg mt-2">
                      {/* Aqui será adicionado o componente do Google Maps */}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 p-4 bg-soft-purple rounded-lg">
              <FormField
                control={form.control}
                name="timeWindow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Intervalo de Horário</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 14:00 - 16:00" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Observação</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Digite uma observação (opcional)"
                        className="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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