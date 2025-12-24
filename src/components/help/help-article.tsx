import type { ReactNode } from "react";

type HelpArticleProps = {
  title: string;
  children: ReactNode;
  titleClassName?: string;
};

export function HelpArticle({
  title,
  children,
  titleClassName,
}: HelpArticleProps) {
  return (
    <div>
      <h3
        className={titleClassName ?? "mb-2 text-base font-semibold md:text-lg"}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
