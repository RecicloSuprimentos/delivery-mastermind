import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface CustomerInfoFieldsProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
}

const CustomerInfoFields = ({
  customerName,
  onCustomerNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange
}: CustomerInfoFieldsProps) => {
  const [mask, setMask] = useState("(99) 9999-9999");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Remove todos os caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    
    // Verifica se é celular (começa com 9) ou telefone fixo
    if (digits.length > 2) {
      const isCellPhone = digits.substring(2, 3) === '9';
      setMask(isCellPhone ? "(99) 99999-9999" : "(99) 9999-9999");
      
      // Só valida após o usuário parar de digitar
      if (isTyping) {
        const timeoutId = setTimeout(() => {
          setIsTyping(false);
          // Validação da quantidade de dígitos
          if (digits.length > 0 && digits.length !== (isCellPhone ? 11 : 10)) {
            toast({
              title: "Erro no telefone",
              description: isCellPhone 
                ? "Celular deve ter 11 dígitos (incluindo DDD)" 
                : "Telefone fixo deve ter 10 dígitos (incluindo DDD)",
              variant: "destructive",
            });
          }
        }, 1000); // Aguarda 1 segundo após a última digitação

        return () => clearTimeout(timeoutId);
      }
    }
  }, [phone, toast, isTyping]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    onPhoneChange(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomerNameChange(e.target.value.toUpperCase());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value.toLowerCase());
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Cliente</label>
        <Input
          required
          value={customerName}
          onChange={handleNameChange}
          placeholder="Nome completo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone</label>
          <InputMask
            mask={mask}
            value={phone}
            onChange={handlePhoneChange}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                required
                placeholder="(00) 0000-0000"
              />
            )}
          </InputMask>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoFields;