import PocketBase from "pocketbase";
import type {
  CommentsRecord,
  NotificationsRecord,
  ProjectMembersRecord,
  ProjectsRecord,
  TasksRecord,
  TypedPocketBase,
  UsersRecord,
} from "@/lib/pocketbase-types";

// --- Mock Data Imports ---
import mockComments from "./mock-data/comments.json";
import mockNotifications from "./mock-data/notifications.json";
import mockProjects from "./mock-data/projects.json";
import mockTasks from "./mock-data/tasks.json";
import mockUserProjects from "./mock-data/userProjects.json";
import mockUsers from "./mock-data/users.json";

// --- Constants ---
const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090/";
const PB_ADMIN_EMAIL =
  process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com";
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "admin12345";

// --- Type Definitions ---
interface PocketBaseErrorData {
  code: number;
  message: string;
  data: Record<string, unknown>;
}

interface PocketBaseError {
  originalError: {
    status: number;
    data: PocketBaseErrorData;
    isAbort: boolean;
    // Add other properties as needed
  };
}

function isPocketBaseError(error: unknown): error is PocketBaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "originalError" in error &&
    typeof (error as PocketBaseError).originalError === "object" &&
    (error as PocketBaseError).originalError !== null &&
    "data" in (error as PocketBaseError).originalError
  );
}

// Using generated types is generally good, but for seeding,
// the imported JSON structure might differ slightly (e.g., lacking expand).
// Using Partial or defining specific input types might be necessary if issues arise.

type MockUser = (typeof mockUsers)[number];
type MockProject = (typeof mockProjects)[number];
type MockUserProject = (typeof mockUserProjects)[number];
type MockTask = (typeof mockTasks)[number];
type MockComment = (typeof mockComments)[number];
type MockNotification = (typeof mockNotifications)[number];

// --- Helper Functions ---

async function truncateCollections(pb: TypedPocketBase) {
  console.log("Clearing existing collections via PocketBase API...");
  const orderedCollections = [
    "comments",
    "notifications",
    "tasks",
    "project_members",
    "projects",
    "organization_members",
    "organizations",
    "groups", // Must come before users since groups have required manager reference
    "users",
  ] as const;

  for (const collection of orderedCollections) {
    const records = await pb.collection(collection).getFullList({
      batch: 200,
    });
    if (records.length === 0) {
      continue;
    }

    console.log(`Deleting ${records.length} records from '${collection}'...`);
    for (const record of records) {
      await pb.collection(collection).delete(record.id);
    }
  }
}

// --- Main Seeding Logic ---
async function seedDatabase() {
  // 1. Initialize PocketBase client
  const pb = new PocketBase(PB_URL) as TypedPocketBase;

  try {
    // 2. Authenticate as admin
    console.log(`Authenticating with PocketBase at ${PB_URL} as admin...`);
    await pb
      .collection("_superusers") // Use _superusers for admin login
      .authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
    console.log("Authentication successful.");

    // 3. Truncate existing data through PocketBase to ensure hooks/validation run
    await truncateCollections(pb);
    console.log("Existing data cleared.");

    // 4. Insert Users
    console.log(`Inserting ${mockUsers.length} users...`);
    let batch = pb.createBatch();
    mockUsers.forEach((user: MockUser) => {
      batch.collection("users").create(user);
    });
    let result = await batch.send();
    console.log(`Insert users result: ${result[0].status}`);
    const createdUsers = await pb
      .collection("users")
      .getFullList<UsersRecord>();
    const userIdMap = new Map<string, string>(
      createdUsers.map((u) => [u.username, u.id]),
    );
    console.log(`${createdUsers.length} users inserted.`);

    // 5. Create a manager user first for group assignment
    console.log("Creating a manager user for group assignment...");
    const managerResult = await pb.collection("users").create({
      username: "manager.main",
      first_name: "مدیر",
      last_name: "اصلی",
      password: "manager123",
      passwordConfirm: "manager123",
      role: "manager",
      active: true,
    });
    const managerId = managerResult.id;
    userIdMap.set("manager.main", managerId);
    console.log("Manager user created.");

    // 6. Create Organizations (after users exist)
    console.log("Inserting default organization...");
    let defaultOrgId = "";
    try {
      const orgResult = await pb.collection("organizations").create({
        name: "Default Organization",
        slug: "default-organization",
        description: "Default organization for projects",
        active: true,
        plan: "free",
      });
      defaultOrgId = orgResult.id;
      console.log("Default organization created.");
    } catch (orgError: unknown) {
      if (isPocketBaseError(orgError)) {
        console.error(
          "Organization creation error:",
          JSON.stringify(orgError.originalError, null, 2),
        );
      } else {
        console.error("Organization creation error:", orgError);
      }
      throw orgError;
    }

    // 6.1 Assign organization memberships
    console.log("Assigning users to default organization...");
    for (const [username, userId] of userIdMap) {
      const user = createdUsers.find((u) => u.id === userId);
      const role =
        user?.role === "admin" || user?.role === "manager" ? "admin" : "member";
      if (defaultOrgId) {
        try {
          await pb.collection("organization_members").create({
            organization: defaultOrgId,
            user: userId,
            role,
            status: "active",
            joined_at: new Date().toISOString(),
          });
        } catch (err) {
          console.warn(`Failed to assign org membership for ${username}:`, err);
        }
      }
    }

    // 7. Create Groups (after users exist)
    console.log("Inserting 1 default group...");
    let defaultGroupId = "";
    if (managerId) {
      console.log(`Manager user ID: ${managerId}`);
      try {
        const groupResult = await pb.collection("groups").create({
          name: "Default Group",
          description: "Default group for projects",
          manager: managerId,
          active: true,
        });
        defaultGroupId = groupResult.id;
        console.log("Default group created.");
      } catch (groupError: unknown) {
        if (isPocketBaseError(groupError)) {
          console.error(
            "Group creation error:",
            JSON.stringify(groupError.originalError, null, 2),
          );
        } else {
          console.error("Group creation error:", groupError);
        }
        throw groupError;
      }
    }

    // 6.5 Assign supervisors and employees to the group
    console.log("Assigning supervisors and employees to the default group...");
    const usernamesToAssignGroup = [
      "supervisor.hassan",
      "supervisor.zahra",
      "supervisor.mahmoud",
      "dev.mohammad",
      "dev.sara",
      "dev.amir",
      "dev.narges",
      "dev.hooman",
    ];
    for (const username of usernamesToAssignGroup) {
      const userId = userIdMap.get(username);
      if (userId && defaultGroupId) {
        try {
          await pb.collection("users").update(userId, {
            group: defaultGroupId,
          });
          console.log(`User ${username} assigned to group`);
        } catch (err) {
          console.warn(`Failed to assign user ${username} to group:`, err);
        }
      }
    }

    // 8. Insert Projects
    console.log(`Inserting ${mockProjects.length} projects...`);
    batch = pb.createBatch();
    mockProjects.forEach((project: MockProject) => {
      const supervisorId = userIdMap.get(project.supervisor);
      if (supervisorId && defaultGroupId && defaultOrgId) {
        batch.collection("projects").create({
          ...project,
          supervisor: supervisorId,
          group: defaultGroupId,
          organization: defaultOrgId,
        });
      }
    });
    result = await batch.send();
    console.log(`Insert projects result: ${result[0].status}`);
    const createdProjects = await pb
      .collection("projects")
      .getFullList<ProjectsRecord>();
    const projectIdMap = new Map<string, string>(
      createdProjects
        .filter((p): p is ProjectsRecord & { code: string } => Boolean(p.code))
        .map((p) => [p.code, p.id]),
    );
    console.log(`${createdProjects.length} projects inserted.`);

    // 9. Insert Project Members
    console.log(`Inserting ${mockUserProjects.length} project members...`);
    batch = pb.createBatch();
    mockUserProjects.forEach((userProject: MockUserProject) => {
      const userId = userIdMap.get(userProject.user);
      const projectId = projectIdMap.get(userProject.project);
      if (userId && projectId) {
        batch.collection("project_members").create({
          user: userId,
          project: projectId,
          role: "member",
          added_at: userProject.created,
        });
      } else {
        console.warn(
          `Skipping user-project link: User '${userProject.user}' or Project '${userProject.project}' not found. `,
        );
      }
    });
    result = await batch.send();
    console.log(`Insert user-project links result: ${result[0].status}`);
    const createdProjectMembers = await pb
      .collection("project_members")
      .getFullList<ProjectMembersRecord>();
    console.log(`${createdProjectMembers.length} project members inserted.`);

    // 10. Insert Tasks
    console.log(`Inserting ${mockTasks.length} tasks...`);
    batch = pb.createBatch();
    mockTasks.forEach((task: MockTask) => {
      const creatorId = userIdMap.get(task.creator);
      const assigneeId = userIdMap.get(task.assignee);
      const projectId = projectIdMap.get(task.project);
      if (creatorId && assigneeId && projectId) {
        batch.collection("tasks").create({
          ...task,
          creator: creatorId,
          assignee: assigneeId,
          project: projectId,
        });
      } else {
        console.warn(
          `Skipping task '${task.title}': Creator '${task.creator}', Assignee '${task.assignee}', or Project '${task.project}' not found.`,
        );
      }
    });
    result = await batch.send();
    console.log(`Insert tasks result: ${result[0].status}`);
    const createdTasks = await pb
      .collection("tasks")
      .getFullList<TasksRecord>();
    const taskIdMap = new Map<string, string>(
      createdTasks
        .filter((t): t is TasksRecord & { display_id: string } =>
          Boolean(t.display_id),
        )
        .map((t) => [t.display_id, t.id]),
    );
    console.log(`${createdTasks.length} tasks inserted.`);

    // 10. Insert Comments
    console.log(`Inserting ${mockComments.length} comments...`);
    batch = pb.createBatch();
    mockComments.forEach((comment: MockComment) => {
      const userId = userIdMap.get(comment.user);
      const taskId = taskIdMap.get(comment.task);
      if (userId && taskId) {
        batch.collection("comments").create({
          ...comment,
          user: userId,
          task: taskId,
        });
      } else {
        console.warn(
          `Skipping comment: User '${comment.user}' or Task '${comment.task}' not found.`,
        );
      }
    });
    result = await batch.send();
    console.log(`Insert comments result: ${result[0].status}`);
    const createdComments = await pb
      .collection("comments")
      .getFullList<CommentsRecord>();
    console.log(`${createdComments.length} comments inserted.`);

    // 11. Insert Notifications
    console.log(`Inserting ${mockNotifications.length} notifications...`);
    batch = pb.createBatch();
    mockNotifications.forEach((notification: MockNotification) => {
      const userId = userIdMap.get(notification.user);
      if (userId) {
        batch.collection("notifications").create({
          ...notification,
          user: userId,
        });
      } else {
        console.warn(
          `Skipping notification: User '${notification.user}' not found.`,
        );
      }
    });
    result = await batch.send();
    console.log(`Insert notifications result: ${result[0].status}`);
    const createdNotifications = await pb
      .collection("notifications")
      .getFullList<NotificationsRecord>();
    console.log(`${createdNotifications.length} notifications inserted.`);

    // 12. Final Summary
    console.log(
      "\n✅ Successfully Seeded Database with mock data",
      `\n- ${createdUsers.length} users created`,
      `\n- ${createdProjects.length} projects created`,
      `\n- ${createdProjectMembers.length} project members created`,
      `\n- ${createdTasks.length} tasks created`,
      `\n- ${createdComments.length} comments created`,
      `\n- ${createdNotifications.length} notifications created`,
    );
  } catch (error: unknown) {
    console.error("\n❌ Error during seeding process:");

    if (isPocketBaseError(error)) {
      console.error("PocketBase Error:", error.originalError);
      if (error.originalError.data) {
        console.error(
          "PocketBase Error Details:",
          JSON.stringify(error.originalError.data, null, 2),
        );
      }
    } else {
      // Log other types of errors
      console.error("Unknown Error:", error);
    }

    process.exit(1);
  } finally {
    // Ensure PocketBase connection is closed or resources are released if necessary
    // pb.authStore.clear(); // Example: Clear auth state
  }
}

seedDatabase();
