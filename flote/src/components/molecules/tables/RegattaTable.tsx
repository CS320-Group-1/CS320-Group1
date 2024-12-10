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
  const [rows, setRows] = useState<SearchTableRow[]>([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    setRows([]);

    regattas.forEach(regatta => {
      socket.emit("getRegattaById", regatta._id, (res: EventResponse) => {
        if (res.error) {
          console.error("getRegattaById failed:", res.error);
        } else {
          const races = res.data.races || [];
          const sortedRaces = races.sort((r1, r2) => r1.startTime > r2.startTime ? r2 : r1);
          const date = sortedRaces.length > 0 ? sortedRaces[0].startTime ? new Date(sortedRaces[0].startTime).toLocaleDateString() : "TBD" : "TBD";

          const row: SearchTableRow = {
            id: regatta._id!,
            date: typeof date === 'string' ? date : new Date(date).toLocaleDateString(),
            name: regatta.name,
            action: <OpenExternalLinkButton />,
          }

          setRows((rows) => [...rows, row]);
        }
      });
    });

  }, [regattas]);

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
