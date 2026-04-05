import {
  CONTRATOS_HISTORY_LIMIT,
  CONTRATOS_HISTORY_STORAGE_KEY,
  LOCADOR_STORAGE_KEY,
  defaultLocador,
  type ContratoHistoryItem,
  type ContratoTermos,
  type LocadorData,
  type LocatarioData,
  type VeiculoData,
} from "./types";

export function loadStoredLocador(): LocadorData {
  try {
    const saved = localStorage.getItem(LOCADOR_STORAGE_KEY);
    return saved ? { ...defaultLocador, ...JSON.parse(saved) } : defaultLocador;
  } catch {
    return defaultLocador;
  }
}

export function loadContratoHistory(): ContratoHistoryItem[] {
  try {
    const saved = localStorage.getItem(CONTRATOS_HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function persistLocador(locador: LocadorData) {
  localStorage.setItem(LOCADOR_STORAGE_KEY, JSON.stringify(locador));
}

export function persistContratoHistory(history: ContratoHistoryItem[]) {
  localStorage.setItem(CONTRATOS_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function createContratoHistoryItem(
  locador: LocadorData,
  locatario: LocatarioData,
  veiculo: VeiculoData,
  termos: ContratoTermos,
): ContratoHistoryItem {
  const locatarioNome = locatario.nome?.trim() || "Locatário não informado";
  const veiculoLabel = [veiculo.modelo, veiculo.placa].filter(Boolean).join(" - ");
  const titulo = `${locatarioNome}${veiculoLabel ? ` (${veiculoLabel})` : ""}`;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    titulo,
    locador: { ...locador },
    locatario: { ...locatario },
    veiculo: { ...veiculo },
    termos: { ...termos },
  };
}

export function prependContratoHistory(
  history: ContratoHistoryItem[],
  item: ContratoHistoryItem,
) {
  return [item, ...history].slice(0, CONTRATOS_HISTORY_LIMIT);
}
