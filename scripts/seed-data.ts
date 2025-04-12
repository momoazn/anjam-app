import {
  ProjectsRecord,
  TasksRecord,
  TypedPocketBase,
  UsersRecord,
} from "@/lib/pocketbase-types";
import { Database } from "bun:sqlite";
import { join } from "path";
import PocketBase from "pocketbase";

import mockComments from "../mock-data/comments.json";
import mockProjects from "../mock-data/projects.json";
import mockTasks from "../mock-data/tasks.json";
import mockUserProjects from "../mock-data/userProjects.json";
import mockUsers from "../mock-data/users.json";

function getUserIdByUsername(users: UsersRecord[], username: string) {
  return users.find((user) => user.username === username)?.id;
}

function getProjectIdByCode(projects: ProjectsRecord[], code: string) {
  return projects.find((project) => project.code === code)?.id;
}

function getTaskIdByDisplayId(tasks: TasksRecord[], displayId: string) {
  return tasks.find((task) => task.display_id === displayId)?.id;
}

async function generate() {
  const dbPath = join(import.meta.dirname, "..", "pb_data", "data.db");
  const db = new Database(dbPath);
  db.run(`
    DELETE FROM comments;
    DELETE FROM tasks;
    DELETE FROM users_projects;
    DELETE FROM projects;
    DELETE FROM users;
  `);
  console.log("Successfully truncated tables");
  db.close();

  const pb = new PocketBase("http://127.0.0.1:8090/") as TypedPocketBase;

  try {
    console.log("Authenticating with superusers");
    await pb
      .collection("_superusers")
      .authWithPassword("admin@example.com", "admin12345");

    let batch = pb.createBatch();

    console.log("Generating users");
    mockUsers.forEach((user) => batch.collection("users").create(user));
    await batch.send();
    const users = await pb.collection("users").getFullList();

    console.log("Generating projects");
    batch = pb.createBatch();
    mockProjects.forEach((project) => {
      batch.collection("projects").create(project);
    });
    await batch.send();
    const projects = await pb.collection("projects").getFullList();

    console.log("Generating users projects");
    batch = pb.createBatch();
    mockUserProjects.forEach((userProject) => {
      batch.collection("users_projects").create({
        ...userProject,
        user: getUserIdByUsername(users, userProject.user),
        project: getProjectIdByCode(projects, userProject.project),
      });
    });
    await batch.send();

    console.log("Generating tasks");
    batch = pb.createBatch();
    mockTasks.forEach((task) => {
      batch.collection("tasks").create({
        ...task,
        creator: getUserIdByUsername(users, task.creator),
        assignee: getUserIdByUsername(users, task.assignee),
        project: getProjectIdByCode(projects, task.project),
      });
    });
    await batch.send();
    const tasks = await pb.collection("tasks").getFullList();

    console.log("Generating comments");
    batch = pb.createBatch();
    mockComments.forEach((comment) => {
      batch.collection("comments").create({
        ...comment,
        user: getUserIdByUsername(users, comment.user),
        task: getTaskIdByDisplayId(tasks, comment.task),
      });
    });
    await batch.send();
    const comments = await pb.collection("comments").getFullList();

    console.log(
      "✅ Successfully Seeded Database with mock data",
      `\n- ${users.length} users created`,
      `\n- ${projects.length} projects created`,
      `\n- ${tasks.length} tasks created`,
      `\n- ${comments.length} comments created`,
    );
  } catch (error) {
    console.error("Error generating mock data", JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

generate();
