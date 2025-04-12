import { pb } from "@/lib/pocketbase";
import { ProjectsResponse, UsersRoleOptions } from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";

export default function Projects() {
  const user = useAuthStore().user;

  // const { data: userProjects, isPending: isLoadingProjects } = useQuery({
  //   queryKey: ["projects", user?.id],
  //   queryFn: () => {
  //     return pb.collection("projects").getFullList<ProjectsResponse>({
  //       batch: 100,
  //       filter:
  //         user?.role === UsersRoleOptions.employee
  //           ? `assignee = "${user?.id}"`
  //           : "",
  //     });
  //   },
  // });

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900"></div>
  );
}
