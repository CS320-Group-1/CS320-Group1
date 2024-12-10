import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EventResponse } from "@models/EventResponse";
import { Regatta } from "@models/Regatta";
import { socket } from "@src/socket";

import AppLayout from "@templates/AppLayout";
import CreateRegattaModal from "@molecules/modals/CreateRegattaModal";
import List from "@atoms/List";
import ResponsiveCard from "@molecules/ResponsiveCard";

export default function AccountHome() {
  const [regattasAdmin, setRegattasAdmin] = useState<Regatta[]>([]);
  const [regattasTimekeeper, setRegattasTimekeeper] = useState<Regatta[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth0();
  const navigate = useNavigate();

  const handleAddRegatta = (data: any) => {
    socket.emit(
      "createRegatta",
      { name: data.regattaName, adminId: user?.sub },
      (res: EventResponse) => {
        if (res.error) {
          console.error("Regatta creation failed:", res.error);
        } else {
          navigate(`/regatta/${res.data.id}`, {
            state: { regatta: res.data },
          });
        }
      }
    );
  };

  useEffect(() => {
    socket.emit(
      "getRegattas",
      { id: user?.sub, email: user?.email },
      (res: EventResponse) => {
        if (res.error) {
          console.error("getRegattas failed:", res.error);
        } else {
          setRegattasAdmin(res.data.regattas.admin);
          setRegattasTimekeeper(res.data.regattas.timekeeper);
          setIsLoading(false);
        }
      }
    );
  }, [user]);

  return (
    <AppLayout isLoading={isLoading} title="home" className="md:flex-row">
      <ResponsiveCard
        title="my regattas"
        action="add"
        onAction={() => setIsModalOpen(true)}
      >
        <List
          ariaLabel="list of regattas you admin"
          itemType="regatta"
          items={regattasAdmin}
        ></List>
      </ResponsiveCard>
      <ResponsiveCard title="shared with me">
        <List
          ariaLabel="list of regattas you timekeep for"
          itemType="regatta"
          items={regattasTimekeeper}
        ></List>
      </ResponsiveCard>
      <CreateRegattaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => handleAddRegatta(data)}
      ></CreateRegattaModal>
    </AppLayout>
  );
}
