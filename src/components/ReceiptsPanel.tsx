import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { deleteReceipt, listReceipts } from "@/lib/receipts.functions";
import { toast } from "sonner";

export function ReceiptsPanel() {
  const fetchReceipts = useServerFn(listReceipts);
  const removeReceipt = useServerFn(deleteReceipt);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["receipts"], queryFn: () => fetchReceipts(), refetchInterval: 15000 });
  const del = useMutation({
    mutationFn: (r: { id: string; file_path: string }) => removeReceipt({ data: r }),
    onSuccess: () => {
      toast.success("Comprovante apagado.");
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
    onError: () => toast.error("Não foi possível apagar. Tente de novo."),
  });
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Comprovantes enviados</h2>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum comprovante enviado ainda.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((r) => (
            <div key={r.id} className="relative overflow-hidden rounded-lg border border-border bg-background">
              <a href={r.url ?? "#"} target="_blank" rel="noreferrer" className="block hover:border-primary">
                {r.mime?.startsWith("image/") && r.url ? (
                  <img src={r.url} alt="Comprovante" className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">PDF — clique para abrir</div>
                )}
                <div className="space-y-0.5 p-3 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">{r.customer_name || "Sem nome"}</div>
                  {r.amount && <div>Valor: R$ {r.amount}</div>}
                  {r.customer_phone && <div>Tel: {r.customer_phone}</div>}
                  <div>{new Date(r.created_at).toLocaleString("pt-BR")}</div>
                </div>
              </a>
              <button
                type="button"
                onClick={() => del.mutate({ id: r.id, file_path: r.file_path })}
                disabled={del.isPending}
                className="absolute right-2 top-2 rounded-md bg-destructive p-1.5 text-destructive-foreground shadow hover:opacity-90 disabled:opacity-50"
                title="Apagar comprovante"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
