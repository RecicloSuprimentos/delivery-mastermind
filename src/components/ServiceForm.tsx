import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { ServiceFormValues } from "./service-form/types";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IMaskInput } from "react-imask";
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';
import { useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyB30rumsKJs3dV_NZ8N0khyf-n4yWDjQKI";

const mapContainerStyle = {
  width: '100%',
  height: '300px'
};

const center = {
  lat: -23.5505,
  lng: -46.6333
};

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
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

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

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        form.setValue('address', place.formatted_address);
      }
    }
  };

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
  }, []);

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
    <div className="space-y-6 p-6">
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
          <div className="space-y-6">
            {/* Primeira linha: Tipo e ID do serviço */}
            <div className="grid grid-cols-[1fr,2fr] gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Tipo</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
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
                    <FormLabel className="font-medium">ID do Serviço *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Digite o ID" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Segunda linha: Nome do Cliente, Telefone e Email */}
            <div className="grid grid-cols-[2fr,1fr,2fr] gap-6">
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
                      <Input {...field} type="email" placeholder="Digite o e-mail" className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Terceira linha: Endereço e Complemento */}
            <div className="grid grid-cols-[2fr,1fr] gap-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Endereço *</FormLabel>
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Digite o endereço completo"
                            className="bg-white"
                          />
                        </FormControl>
                      </Autocomplete>
                    </LoadScript>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressComplement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Complemento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Apto, Sala, etc." className="bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quarta linha: Mapa e Informações Adicionais */}
            <div className="grid grid-cols-[2fr,1fr] gap-6">
              <div className="bg-muted rounded-lg overflow-hidden">
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={13}
                    center={center}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  />
                </LoadScript>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="timeWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Intervalo de Horário</FormLabel>
                      <FormControl>
                        <IMaskInput
                          mask="00:00 hs às 00:00 hs"
                          unmask={false}
                          value={field.value}
                          onAccept={(value) => field.onChange(value)}
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Ex: 08:00 hs às 12:00 hs"
                        />
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
                      <FormLabel className="font-medium">Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Digite uma observação (opcional)"
                          className="bg-white resize-none h-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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