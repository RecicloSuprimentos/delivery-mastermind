import { DeliveryCard } from "./DeliveryCard";

const columns = [
  { id: "not-assigned", title: "Não Atribuído", count: 3 },
  { id: "assigned", title: "Atribuído", count: 0 },
  { id: "accepted", title: "Aceito", count: 0 },
  { id: "in-transit", title: "Em deslocamento", count: 0 },
  { id: "arrived", title: "Chegou ao local", count: 0 },
  { id: "completed", title: "Finalizado hoje", count: 0 },
];

const sampleDeliveries = [
  {
    code: "457818",
    customer: "LUCIANA MOREIRA SOUZA DE CARVALHO",
    address: "RUA DOUTOR ANTÔNIO GONÇALVES DE MATOS, 345 - CENTRO, SÃO PAULO - SP",
    phone: "(11) 98765-4321",
    status: "pending" as const,
  },
  {
    code: "469141",
    customer: "CS FOMENTO MERCANTIL LTDA",
    address: "AVENIDA BIAS FORTES, 349 - LOURDES, BELO HORIZONTE - MG",
    phone: "(31) 98765-4321",
    status: "pending" as const,
  },
  {
    code: "470609",
    customer: "REGINA FLAVIA",
    address: "RUA JOÃO MANSUR NFURI, 120 - JARDIM PAULISTA, SÃO PAULO - SP",
    phone: "(11) 98765-4322",
    status: "pending" as const,
  },
];

export const KanbanBoard = () => {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex min-w-max h-full p-4 space-x-4">
        {columns.map((column) => (
          <div key={column.id} className="w-80">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">
                {column.title}
              </h2>
              <span className="bg-muted text-secondary text-sm px-2 py-1 rounded">
                {column.count}
              </span>
            </div>
            <div className="bg-muted p-4 rounded-lg min-h-[calc(100vh-12rem)]">
              {column.id === "not-assigned" && sampleDeliveries.map((delivery) => (
                <DeliveryCard key={delivery.code} {...delivery} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};