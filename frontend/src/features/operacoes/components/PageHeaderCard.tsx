interface PageHeaderCardProps {
  title: string;
  description: string;
}

export function PageHeaderCard({ title, description }: PageHeaderCardProps) {
  return (
    <div className="operacoes-page-header">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
