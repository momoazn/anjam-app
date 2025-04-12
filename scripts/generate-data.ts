import {
  CommentsRecord,
  ProjectsRecord,
  TasksPriorityOptions,
  TasksRecord,
  TasksStatusOptions,
  UsersProjectsRecord,
  UsersRecord,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";
import { faker } from "@faker-js/faker";
import { join } from "path";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

type User = Omit<UsersRecord, "tokenKey" | "id"> & {
  passwordConfirm: string;
};
type Project = Omit<ProjectsRecord, "id">;

const ADMIN_COUNT = 3;
const SUPERVISOR_COUNT = 5;
const EMPLOYEE_COUNT = 10;
const PROJECT_COUNT = 5;
const TASKS_COUNT = 30;
const COMMENTS_COUNT = 100;

function generateUser(role: UsersRoleOptions): User {
  const person = faker.person;
  const password = faker.internet.password({ length: 10 });

  return {
    username: faker.internet.username(),
    first_name: person.firstName(),
    last_name: person.lastName(),
    password,
    passwordConfirm: password,
    role,
  };
}

function generateAdmins(count: number = ADMIN_COUNT): User[] {
  return Array.from({ length: count }, () =>
    generateUser(UsersRoleOptions.admin),
  );
}

function generateSupervisors(count: number = SUPERVISOR_COUNT): User[] {
  return Array.from({ length: count }, () =>
    generateUser(UsersRoleOptions.supervisor),
  );
}

function generateEmployees(count: number = EMPLOYEE_COUNT): User[] {
  return Array.from({ length: count }, () =>
    generateUser(UsersRoleOptions.employee),
  );
}

function generateUsers(): User[] {
  return [
    ...generateAdmins(),
    ...generateSupervisors(),
    ...generateEmployees(),
  ];
}

function generateComments(
  tasks: Partial<TasksRecord>[],
  supervisors: User[],
): Partial<CommentsRecord>[] {
  return Array.from({ length: COMMENTS_COUNT }, () => {
    return {
      task: faker.helpers.arrayElement(tasks).display_id,
      user: faker.helpers.arrayElement(supervisors).username,
      content: faker.lorem.sentence(),
      created: faker.date.recent().toISOString(),
    };
  });
}

function generateTasks(
  supervisors: User[],
  employees: User[],
  projects: Project[],
): Partial<TasksRecord>[] {
  const projectCodeToTaskCount: Record<string, number> = {};

  return Array.from({ length: TASKS_COUNT }, () => {
    const createdAt = faker.date.recent({ days: 10 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
    const project = faker.helpers.arrayElement(projects);
    const projectCode = project.code as string;

    const taskCount = projectCodeToTaskCount[projectCode] ?? 1;
    projectCodeToTaskCount[projectCode] = taskCount + 1;

    return {
      title:
        capitalize(faker.hacker.verb()) +
        " " +
        capitalize(faker.hacker.adjective()) +
        " " +
        capitalize(faker.hacker.noun()),
      display_id: project.code + "-" + taskCount.toString().padStart(3, "0"),
      description: capitalize(faker.lorem.paragraph()),
      project: project.code,
      creator: faker.helpers.arrayElement(supervisors).username,
      assignee: faker.helpers.arrayElement(employees).username,
      priority: faker.helpers.arrayElement(Object.values(TasksPriorityOptions)),
      status: faker.helpers.arrayElement(Object.values(TasksStatusOptions)),
      deadline: faker.date.soon({ days: 15 }).toISOString(),
      created: createdAt.toISOString(),
      updated: updatedAt.toISOString(),
    };
  });
}

function generateProjects(count: number = PROJECT_COUNT): Project[] {
  return Array.from({ length: count }, () => ({
    name: faker.company.name(),
    code: faker.string.alpha({ length: 3, casing: "upper" }),
    created: faker.date.recent().toISOString(),
  }));
}

function generateUserProjects(
  users: User[],
  projects: Project[],
): Partial<UsersProjectsRecord>[] {
  return users.map((user) => {
    return {
      user: user.username,
      project: faker.helpers.arrayElement(projects).name,
      created: faker.date.recent().toISOString(),
    };
  });
}

function generate() {
  const users = generateUsers();
  const supervisors = users.filter(
    (user) => user.role === UsersRoleOptions.supervisor,
  );
  const employees = users.filter(
    (user) => user.role === UsersRoleOptions.employee,
  );
  const projects = generateProjects();
  const userProjects = generateUserProjects(users, projects);
  const tasks = generateTasks(supervisors, employees, projects);
  const comments = generateComments(tasks, supervisors);

  const mockDataPath = join(import.meta.dirname, "..", "mock-data");
  Bun.write(join(mockDataPath, "users.json"), JSON.stringify(users, null, 2));
  Bun.write(
    join(mockDataPath, "projects.json"),
    JSON.stringify(projects, null, 2),
  );
  Bun.write(
    join(mockDataPath, "userProjects.json"),
    JSON.stringify(userProjects, null, 2),
  );
  Bun.write(join(mockDataPath, "tasks.json"), JSON.stringify(tasks, null, 2));
  Bun.write(
    join(mockDataPath, "comments.json"),
    JSON.stringify(comments, null, 2),
  );
}

generate();
