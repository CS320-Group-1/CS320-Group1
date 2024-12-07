import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EventResponse } from "@models/EventResponse";
import { Regatta } from "@models/Regatta";
import { REGATTA_COLUMNS } from "./columns";
import { SearchTableRow } from "@models/SearchTableRow";
import { socket } from "@src/socket";

import OpenExternalLinkButton from "@atoms/icon-buttons/OpenExternalLinkButton";
import ResultsTable from "@atoms/ResultsTable";

type Props = {
  searchQuery: string;
};

export default function RegattaTable({ searchQuery }: Props) {
  const [regattas, setRegattas] = useState<Regatta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const rows: SearchTableRow[] = regattas.map((e) => {
    return {
      id: e._id!,
      date: new Date().toLocaleString(), // TODO
      name: e.name,
      action: <OpenExternalLinkButton />,
    };
  });

  const handleRowAction = (id: React.Key) => {
    navigate(`/regatta/${id}`);
  };

  useEffect(() => {
    socket.emit("searchRegattas", searchQuery, (res: EventResponse) => {
      if (res.error) {
        console.error("searchRegattas failed:", res.error);
      } else {
        setRegattas(res.data.regattas);
        setIsLoading(false);
      }
    });
  }, [searchQuery]);

  return (
    <ResultsTable
      title="regattas"
      columns={REGATTA_COLUMNS}
      rows={rows}
      onRowAction={handleRowAction}
      isLoading={isLoading}
    />
  );
}
