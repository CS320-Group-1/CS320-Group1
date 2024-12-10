import { useSearchParams } from "react-router-dom";

import { Breadcrumb } from "@models/Breadcrumb";

import AppLayout from "@templates/AppLayout";
import BoatTable from "@molecules/tables/BoatTable";
import RaceTable from "@molecules/tables/RaceTable";
import RegattaTable from "@molecules/tables/RegattaTable";

export default function Search() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  const breadcrumbs: Breadcrumb[] = [
    { name: "Home", href: "/home" },
    { name: `"${searchQuery}"` },
  ];

  return (
    <AppLayout title="search" titleMargin="mx-2" breadcrumbs={breadcrumbs}>
      <RegattaTable searchQuery={searchQuery} />
      <RaceTable searchQuery={searchQuery} />
      <BoatTable searchQuery={searchQuery} />
    </AppLayout>
  );
}
