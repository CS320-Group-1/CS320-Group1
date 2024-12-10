type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export default function PageTitle({ title, subtitle, className }: Props) {
  const classes = "text-white bg-primary/90 rounded-md py-2";

  return (
    <div
      className={`flex flex-row mb-3 gap-[5px] mx-2 ${className ?? "md:mx-0"}`}
    >
      <div
        className={`grow flex flex-col sm:flex-row items-start sm:items-end gap-1 sm:gap-2 px-4 pt-4 ${classes}`}
      >
        {subtitle && (
          <div className="font-header lowercase text-xl mb-1">{subtitle}</div>
        )}
        <div className="font-bold uppercase text-4xl">{title}</div>
      </div>
    </div>
  );
}
