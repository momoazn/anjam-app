import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pb } from "@/lib/pocketbase";
import { ProjectsResponse } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";

export default function Projects() {
  const user = useAuthStore().user;

  const { data: userProjects, isPending: isLoadingProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: () => {
      return pb.collection("projects").getFullList<ProjectsResponse>({
        batch: 100,
      });
    },
  });

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white px-4 pb-8 text-gray-900">
      <h1 className="text-2xl font-bold">Projects</h1>
      {isLoadingProjects ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userProjects?.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.code}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
