export const AlertReportError = ({
  error,
  description = "Por favor, verifique se todas as inscrições têm os valores de pagamento preenchidos corretamente.",
}: {
  error: string;
  description?: string;
}) => (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
    <h3 className="text-lg font-semibold text-destructive">
      Erro ao carregar relatório
    </h3>
    <p className="mt-2 text-sm text-destructive/90">{error}</p>
    <p className="mt-4 text-sm text-muted-foreground">{description}</p>
  </div>
);
