import TrashButton from "@atoms/icon-buttons/TrashButton";

type Props = {
  items: any[];
  onDelete: (arg0: any) => void;
  emptyMessage?: string;
  className?: string;
};

export default function EditableList({
  items,
  onDelete,
  emptyMessage,
  className,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <ul className={className}>
        {items.map((e, i) => (
          <li key={i} className="-mb-3">
            <TrashButton onClick={() => onDelete(e)}></TrashButton>
            <span>{e}</span>
          </li>
        ))}
      </ul>
      {emptyMessage && items.length === 0 && (
        <div className="italic ml-2">{emptyMessage}</div>
      )}
    </div>
  );
}
