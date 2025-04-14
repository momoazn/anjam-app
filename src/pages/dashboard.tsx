import { TasksStatusOptions } from "@/lib/pocketbase-types";
import { useProjects, useTasks } from "@/pb-hooks";
import { taskStatusBgColors } from "@/lib/tasks-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  Star,
  Target,
} from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const { data: userTasks, isPending: isLoadingTasks } = useTasks();
  const { data: projects, isPending: isLoadingProjects } = useProjects();

  const stats = useMemo(() => {
    if (isLoadingTasks || !userTasks) return null;

    return {
      total: userTasks.length,
      completed: userTasks.filter((t) => t.status === TasksStatusOptions.done)
        .length,
      inProgress: userTasks.filter(
        (t) => t.status === TasksStatusOptions.in_progress,
      ).length,
      pending: userTasks.filter((t) => t.status === TasksStatusOptions.todo)
        .length,
    };
  }, [userTasks, isLoadingTasks]);

  const recentTasks = useMemo(() => {
    if (isLoadingTasks || !userTasks) return [];
    return [...userTasks]
      .sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
      )
      .slice(0, 5);
  }, [userTasks, isLoadingTasks]);

  const projectStats = useMemo(() => {
    if (isLoadingProjects || !projects || isLoadingTasks || !userTasks)
      return [];

    return projects.map((project) => ({
      ...project,
      taskCount: userTasks.filter((task) => task.project === project.id).length,
      completedTasks: userTasks.filter(
        (task) =>
          task.project === project.id &&
          task.status === TasksStatusOptions.done,
      ).length,
      progress:
        userTasks.filter((task) => task.project === project.id).length > 0
          ? Math.round(
              (userTasks.filter(
                (task) =>
                  task.project === project.id &&
                  task.status === TasksStatusOptions.done,
              ).length /
                userTasks.filter((task) => task.project === project.id)
                  .length) *
                100,
            )
          : 0,
    }));
  }, [projects, userTasks, isLoadingProjects, isLoadingTasks]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold text-gray-900">
        <LayoutDashboard className="h-6 w-6" />
        داشبورد
      </h1>

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کل وظایف"
          value={stats?.total ?? 0}
          icon={<ListTodo className="h-6 w-6 text-blue-500" />}
          color="bg-blue-50"
        />
        <StatCard
          title="تکمیل شده"
          value={stats?.completed ?? 0}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          title="در حال انجام"
          value={stats?.inProgress ?? 0}
          icon={<Clock className="h-6 w-6 text-orange-500" />}
          color="bg-orange-50"
        />
        <StatCard
          title="در انتظار"
          value={stats?.pending ?? 0}
          icon={<BarChart3 className="h-6 w-6 text-purple-500" />}
          color="bg-purple-50"
        />
      </div>

      {/* Project Summary Section */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5" />
          خلاصه پروژه‌ها
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectStats.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{project.name}</h3>
                <span className="text-sm text-gray-500">
                  {digitsEnToFa(project.completedTasks)} از{" "}
                  {digitsEnToFa(project.taskCount)} وظیفه
                </span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>٪{digitsEnToFa(project.progress)} تکمیل شده</span>
                <span>{digitsEnToFa(project.taskCount)} وظیفه</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tasks Section */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            وظایف اخیر
          </h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      taskStatusBgColors[task.status]
                    }`}
                  />
                  <span className="font-medium">{task.title}</span>
                </div>
                <span className="text-sm text-gray-500" dir="ltr">
                  {new Date(task.created).toLocaleDateString("fa-IR")}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Help Section */}
        <section className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="h-5 w-5" />
            راهنمای سریع
          </h2>
          <div className="space-y-4">
            <QuickHelpCard
              title="ایجاد وظیفه جدید"
              description="برای افزودن سریع وظیفه جدید روی دکمه + در بالای صفحه کلیک کنید"
              icon={<FileText className="h-5 w-5 text-blue-500" />}
            />
            <QuickHelpCard
              title="سازماندهی وظایف"
              description="برای تغییر وضعیت وظایف، آنها را بین ستون‌ها بکشید و رها کنید"
              icon={<ListTodo className="h-5 w-5 text-green-500" />}
            />
            <QuickHelpCard
              title="وظایف مهم"
              description="برای دسترسی سریع، روی آیکون ستاره کلیک کنید تا وظیفه را مهم علامت‌گذاری کنید"
              icon={<Star className="h-5 w-5 text-yellow-500" />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-lg ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold">{digitsEnToFa(value)}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

function QuickHelpCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-4 hover:bg-gray-50">
      <div className="rounded-lg bg-gray-100 p-2">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
