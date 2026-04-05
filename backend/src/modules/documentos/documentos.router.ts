import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import { documentImportInputSchema } from "./documentos.schemas";
import * as documentosService from "./documentos.service";

export const documentosRouter = router({
  available: publicProcedure.query(async () => {
    return documentosService.getDocumentExtractionAvailability();
  }),

  extrair: protectedProcedure
    .input(documentImportInputSchema)
    .mutation(async ({ input }) => {
      return documentosService.extractDocument(input);
    }),
});