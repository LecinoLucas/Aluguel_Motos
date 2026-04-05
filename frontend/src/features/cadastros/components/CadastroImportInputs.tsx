import type { ChangeEvent, RefObject } from "react";
import type { ImportKind } from "@/features/gerar-contrato/types";

interface CadastroImportInputsProps {
  kinds: ImportKind[];
  refs: Record<ImportKind, RefObject<HTMLInputElement | null>>;
  onChange: (kind: ImportKind) => (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function CadastroImportInputs({ kinds, refs, onChange }: CadastroImportInputsProps) {
  return (
    <>
      {kinds.map((kind) => (
        <input
          key={kind}
          ref={refs[kind]}
          type="file"
          accept=".pdf,.txt,image/*"
          className="hidden"
          onChange={onChange(kind)}
        />
      ))}
    </>
  );
}