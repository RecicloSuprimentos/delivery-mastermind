import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";
import { IMaskInput } from "react-imask";

interface CustomerInfoSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const CustomerInfoSection = ({ form }: CustomerInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Tipo</FormLabel>
              <FormControl>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="pickup"
                      checked={field.value === "pickup"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-4 w-4"
                    />
                    Coleta
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="delivery"
                      checked={field.value === "delivery"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-4 w-4"
                    />
                    Entrega
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">ID do serviço *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o ID" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-[2fr,1fr,2fr] gap-4">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Nome do Cliente *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Digite o nome do cliente" />
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
                <IMaskInput
                  mask="(00) 00000-0000"
                  unmask={false}
                  value={field.value}
                  onAccept={(value) => field.onChange(value)}
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="(00) 00000-0000"
                />
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
                <Input {...field} type="email" placeholder="Digite o e-mail" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};