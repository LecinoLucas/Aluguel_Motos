import type { ReactNode } from "react";

interface PageHeaderCardProps {
  title: string;
  description: string;
  eyebrow?: string;
  children?: ReactNode;
}

export function PageHeaderCard({ title, description, eyebrow = "Visão operacional", children }: PageHeaderCardProps) {
  return (
    <div className="operacoes-page-header">
      <div className="operacoes-page-header__main">
        <div className="operacoes-page-header__eyebrow">{eyebrow}</div>
        <h1 className="operacoes-page-header__title">{title}</h1>
        <p className="operacoes-page-header__subtitle">{description}</p>
      </div>
      {children ? <div className="operacoes-page-header__aside">{children}</div> : null}
    </div>
  );
}
