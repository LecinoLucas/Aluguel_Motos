interface PageHeaderCardProps {
  title: string;
  description: string;
  eyebrow?: string;
}

export function PageHeaderCard({ title, description, eyebrow = "Visão operacional" }: PageHeaderCardProps) {
  return (
    <div className="operacoes-page-header">
      <div className="operacoes-page-header__eyebrow">{eyebrow}</div>
      <h1 className="operacoes-page-header__title">{title}</h1>
      <p className="operacoes-page-header__subtitle">{description}</p>
    </div>
  );
}
