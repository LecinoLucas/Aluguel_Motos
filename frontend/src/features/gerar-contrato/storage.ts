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

function normalizeLocadorData(locador?: Partial<LocadorData> | null): LocadorData {
  return {
    ...defaultLocador,
    ...locador,
  };
}

export function loadStoredLocadores(): LocadorData[] {
  try {
    const saved = localStorage.getItem(LOCADOR_STORAGE_KEY);
    if (!saved) return [defaultLocador];

    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed.map((item) => normalizeLocadorData(item)) : [defaultLocador];
    }

    return [normalizeLocadorData(parsed)];
  } catch {
    return [defaultLocador];
  }
}

export function loadContratoHistory(): ContratoHistoryItem[] {
  try {
    const saved = localStorage.getItem(CONTRATOS_HISTORY_STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      locadores: Array.isArray(item.locadores)
        ? item.locadores.map((locador: Partial<LocadorData>) => normalizeLocadorData(locador))
        : item.locador
          ? [normalizeLocadorData(item.locador)]
          : [defaultLocador],
    }));
  } catch {
    return [];
  }
}

export function persistLocadores(locadores: LocadorData[]) {
  localStorage.setItem(LOCADOR_STORAGE_KEY, JSON.stringify(locadores));
}

export function persistContratoHistory(history: ContratoHistoryItem[]) {
  localStorage.setItem(CONTRATOS_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export function createContratoHistoryItem(
  locadores: LocadorData[],
  locatario: LocatarioData,
  veiculo: VeiculoData,
  termos: ContratoTermos,
): ContratoHistoryItem {
  const normalizedLocadores =
    locadores.length > 0 ? locadores.map((locador) => normalizeLocadorData(locador)) : [defaultLocador];
  const locatarioNome = locatario.nome?.trim() || "Locatário não informado";
  const veiculoLabel = [veiculo.modelo, veiculo.placa].filter(Boolean).join(" - ");
  const titulo = `${locatarioNome}${veiculoLabel ? ` (${veiculoLabel})` : ""}`;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    titulo,
    locadores: normalizedLocadores,
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
