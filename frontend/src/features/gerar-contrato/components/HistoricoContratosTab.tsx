import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContratoHistoryItem } from "../types";

interface HistoricoContratosTabProps {
  historico: ContratoHistoryItem[];
  onLoad: (item: ContratoHistoryItem) => void;
  onRemove: (id: string) => void;
}

export function HistoricoContratosTab({ historico, onLoad, onRemove }: HistoricoContratosTabProps) {
  return (
    <Card className="contract-section-card">
      <CardHeader>
        <CardTitle>Histórico de Contratos Gerados</CardTitle>
        <p className="text-sm text-muted-foreground">
          Aqui ficam os contratos que você já gerou ou imprimiu nesta máquina.
        </p>
      </CardHeader>
      <CardContent className="contract-history-list space-y-3">
        {historico.length === 0 ? (
          <p className="contract-empty-state text-sm text-muted-foreground">
            Nenhum contrato no histórico ainda. Gere ou imprima um contrato para ele aparecer aqui.
          </p>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="contract-history-item">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{item.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="contract-outline-button" onClick={() => onLoad(item)}>
                    Carregar
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="contract-ghost-button" onClick={() => onRemove(item.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}