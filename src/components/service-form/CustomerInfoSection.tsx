import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";

interface CustomerInfoSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const CustomerInfoSection = ({ form }: CustomerInfoSectionProps) => {
  return (
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

      <div className="grid grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">E-mail</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Digite o e-mail" className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};