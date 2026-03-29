import type { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeading({ title, description, action }: PageHeadingProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
