import { DataTable } from "@/components/data-table";

import data from "./data.json";

export default function NewDashboard() {
  return <DataTable data={data} />;
}
