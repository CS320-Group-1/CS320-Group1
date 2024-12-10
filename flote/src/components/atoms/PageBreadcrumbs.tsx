import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";
import { Breadcrumb } from "@models/Breadcrumb";

type Props = {
  items: Breadcrumb[];
  className?: string;
};

export default function PageBreadcrumbs({ items, className }: Props) {
  return (
    <Breadcrumbs className={`ml-1 mb-3 ${className}`}>
      {items.map((e, i) => (
        <BreadcrumbItem key={i} href={e.href}>
          {e.name}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
