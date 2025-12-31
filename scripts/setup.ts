/**
 * Setup script - Initializes the database with seed data
 * Clears existing data and seeds the database with mock data
 */
import PocketBase from "pocketbase";

import type { TypedPocketBase } from "@/lib/pocketbase-types";

import mockComments from "./mock-data/comments.json";
import mockNotifications from "./mock-data/notifications.json";
import mockOrgMembers from "./mock-data/organization_members.json";
import mockOrganizations from "./mock-data/organizations.json";
import mockProjectMembers from "./mock-data/project_members.json";
import mockProjects from "./mock-data/projects.json";
import mockTags from "./mock-data/tags.json";
import mockTasks from "./mock-data/tasks.json";
// Mock data imports
import mockUsers from "./mock-data/users.json";

// Constants
const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090/";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "admin12345";

const COLLECTIONS_TO_CLEAR = [
  "comments",
  "notifications",
  "time_entries",
  "subtasks",
  "tasks",
  "project_members",
  "project_statuses",
  "projects",
  "tags",
  "organization_members",
  "organizations",
  "users",
] as const;

// Types
type MockUser = (typeof mockUsers)[number];
type MockOrgMember = (typeof mockOrgMembers)[number];
type MockProject = (typeof mockProjects)[number];
type MockProjectMember = (typeof mockProjectMembers)[number];
type MockTask = (typeof mockTasks)[number];
type MockComment = (typeof mockComments)[number];
type MockTag = (typeof mockTags)[number];
type MockNotification = (typeof mockNotifications)[number];

interface SetupStats {
  users: number;
  organizations: number;
  projects: number;
  tasks: number;
  comments: number;
  tags: number;
  notifications: number;
}

// Helper: Create or get record by unique field
async function createOrGet(
  pb: TypedPocketBase,
  collection: string,
  data: Record<string, unknown>,
  uniqueField: string,
  uniqueValue: string,
): Promise<string> {
  try {
    const record = await pb.collection(collection).create(data);
    return record.id;
  } catch {
    const existing = await pb
      .collection(collection)
      .getFirstListItem(`${uniqueField} = "${uniqueValue}"`);
    return existing.id;
  }
}

// Helper: Create record with validation
async function createWithValidation(
  pb: TypedPocketBase,
  collection: string,
  data: Record<string, unknown>,
  validate: () => boolean,
  onError?: (error: unknown) => void,
): Promise<string | null> {
  if (!validate()) {
    return null;
  }

  try {
    const record = await pb.collection(collection).create(data);
    return record.id;
  } catch (error: unknown) {
    onError?.(error);
    return null;
  }
}

// Helper: Clear all collections
async function clearCollections(pb: TypedPocketBase): Promise<void> {
  for (const collection of COLLECTIONS_TO_CLEAR) {
    try {
      const records = await pb
        .collection(collection)
        .getFullList({ batch: 200 });
      if (records.length > 0) {
        for (const record of records) {
          await pb.collection(collection).delete(record.id);
        }
      }
    } catch {
      // Collection might not exist, continue
    }
  }
}

// Helper: Create admin user (matching backend behavior)
async function createAdminUser(
  pb: TypedPocketBase,
  adminData: MockUser,
): Promise<string> {
  const adminId = await createOrGet(
    pb,
    "users",
    {
      username: "admin",
      password: "admin12345",
      passwordConfirm: "admin12345",
      role: "admin",
      active: true,
    },
    "username",
    "admin",
  );

  // Update with additional fields
  try {
    await pb.collection("users").update(adminId, {
      email: adminData.email,
      verified: adminData.verified,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
    });
  } catch {
    // Ignore update errors
  }

  return adminId;
}

// Helper: Create regular user
async function createUser(
  pb: TypedPocketBase,
  userData: MockUser,
): Promise<string> {
  return createOrGet(pb, "users", userData, "username", userData.username);
}

// Helper: Create organization
async function createOrganization(
  pb: TypedPocketBase,
  orgData: (typeof mockOrganizations)[number],
): Promise<string> {
  return createOrGet(pb, "organizations", orgData, "slug", orgData.slug);
}

// Helper: Create project
async function createProject(
  pb: TypedPocketBase,
  projectData: MockProject,
  orgId: string,
  supervisorId: string,
): Promise<string | null> {
  return createWithValidation(
    pb,
    "projects",
    {
      name: projectData.name,
      code: projectData.code,
      description: projectData.description,
      organization: orgId,
      supervisor: supervisorId,
    },
    () => Boolean(orgId && supervisorId),
    (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response: { data?: unknown } }).response;
        console.error(
          `Failed to create project ${projectData.name}:`,
          JSON.stringify(response.data, null, 2),
        );
      } else {
        console.error(`Failed to create project ${projectData.name}:`, error);
      }
    },
  );
}

// Helper: Create task
async function createTask(
  pb: TypedPocketBase,
  taskData: MockTask,
  projectId: string,
  creatorId: string,
  assigneeId: string,
): Promise<{ id: string; displayId: string } | null> {
  const taskId = await createWithValidation(
    pb,
    "tasks",
    {
      title: taskData.title,
      description: taskData.description,
      project: projectId,
      creator: creatorId,
      assignee: assigneeId,
      status: taskData.status,
      priority: taskData.priority,
      task_type: taskData.task_type,
      story_points: taskData.story_points,
      estimated_minutes: taskData.estimated_minutes,
      deadline: taskData.deadline,
    },
    () => Boolean(projectId && creatorId && assigneeId),
    (error) => {
      console.error(`Failed to create task ${taskData.title}:`, error);
    },
  );

  if (!taskId) return null;

  // Get display_id for mapping
  try {
    const task = await pb.collection("tasks").getOne(taskId);
    return { id: taskId, displayId: task.display_id || taskId };
  } catch {
    return { id: taskId, displayId: taskId };
  }
}

// Main setup function
export async function setup(): Promise<void> {
  const pb = new PocketBase(PB_URL) as TypedPocketBase;
  const stats: SetupStats = {
    users: 0,
    organizations: 0,
    projects: 0,
    tasks: 0,
    comments: 0,
    tags: 0,
    notifications: 0,
  };

  try {
    // Authenticate
    console.log("🔐 Authenticating...");
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log("✅ Authenticated\n");

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await clearCollections(pb);
    console.log("✅ Cleared\n");

    // Create users
    console.log(`👥 Creating ${mockUsers.length} users...`);
    const userIdMap = new Map<string, string>();

    // Create admin first
    const adminData = mockUsers.find((u) => u.username === "admin");
    if (adminData) {
      const adminId = await createAdminUser(pb, adminData);
      userIdMap.set("admin", adminId);
    }

    // Create other users
    for (const userData of mockUsers) {
      if (userData.username === "admin") continue;
      const userId = await createUser(pb, userData);
      userIdMap.set(userData.username, userId);
    }
    stats.users = userIdMap.size;
    console.log(`✅ Created ${stats.users} users\n`);

    // Create organizations
    console.log(`🏢 Creating ${mockOrganizations.length} organizations...`);
    const orgIdMap = new Map<string, string>();
    for (const orgData of mockOrganizations) {
      const orgId = await createOrganization(pb, orgData);
      orgIdMap.set(orgData.slug, orgId);
    }
    stats.organizations = orgIdMap.size;
    console.log(`✅ Created ${stats.organizations} organizations\n`);

    // Create organization memberships
    console.log(
      `🔗 Creating ${mockOrgMembers.length} organization memberships...`,
    );
    let orgMembersCreated = 0;
    for (const memberData of mockOrgMembers as MockOrgMember[]) {
      const orgId = orgIdMap.get(memberData.organization);
      const userId = userIdMap.get(memberData.user);
      if (orgId && userId) {
        try {
          await pb.collection("organization_members").create({
            organization: orgId,
            user: userId,
            role: memberData.role,
            status: memberData.status,
            joined_at: memberData.joined_at,
          });
          orgMembersCreated++;
        } catch {
          // Already exists, skip
        }
      }
    }
    console.log(`✅ Created ${orgMembersCreated} organization memberships\n`);

    // Create projects
    console.log(`📁 Creating ${mockProjects.length} projects...`);
    const projectIdMap = new Map<string, string>();
    for (const projectData of mockProjects as MockProject[]) {
      const orgId = orgIdMap.get(projectData.organization);
      const supervisorId = userIdMap.get(projectData.supervisor);
      if (orgId && supervisorId) {
        const projectId = await createProject(
          pb,
          projectData,
          orgId,
          supervisorId,
        );
        if (projectId) {
          projectIdMap.set(projectData.code, projectId);
        }
      }
    }
    stats.projects = projectIdMap.size;
    console.log(`✅ Created ${stats.projects} projects\n`);

    // Create project members
    console.log(
      `👤 Creating ${mockProjectMembers.length} project memberships...`,
    );
    let projectMembersCreated = 0;
    for (const memberData of mockProjectMembers as MockProjectMember[]) {
      const projectId = projectIdMap.get(memberData.project);
      const userId = userIdMap.get(memberData.user);
      const addedById =
        userIdMap.get(memberData.added_by) || userIdMap.get("admin");
      if (projectId && userId) {
        try {
          await pb.collection("project_members").create({
            project: projectId,
            user: userId,
            role: memberData.role,
            notifications: memberData.notifications,
            added_at: memberData.added_at,
            added_by: addedById,
          });
          projectMembersCreated++;
        } catch {
          // Already exists, skip
        }
      }
    }
    console.log(`✅ Created ${projectMembersCreated} project memberships\n`);

    // Create tasks
    console.log(`✅ Creating ${mockTasks.length} tasks...`);
    const taskIdMap = new Map<string, string>(); // Maps display_id -> task id
    for (const taskData of mockTasks as MockTask[]) {
      const projectId = projectIdMap.get(taskData.project);
      const creatorId = userIdMap.get(taskData.creator);
      const assigneeId = userIdMap.get(taskData.assignee);
      if (projectId && creatorId && assigneeId) {
        const taskResult = await createTask(
          pb,
          taskData,
          projectId,
          creatorId,
          assigneeId,
        );
        if (taskResult) {
          taskIdMap.set(taskResult.displayId, taskResult.id);
        }
      }
    }
    stats.tasks = taskIdMap.size;
    console.log(`✅ Created ${stats.tasks} tasks\n`);

    // Create comments
    console.log(`💬 Creating ${mockComments.length} comments...`);
    for (const commentData of mockComments as MockComment[]) {
      const taskId = taskIdMap.get(commentData.task);
      const userId = userIdMap.get(commentData.user);
      if (taskId && userId) {
        try {
          await pb.collection("comments").create({
            task: taskId,
            user: userId,
            content: commentData.content,
          });
          stats.comments++;
        } catch {
          // Skip errors
        }
      }
    }
    console.log(`✅ Created ${stats.comments} comments\n`);

    // Create tags
    console.log(`🏷️  Creating ${mockTags.length} tags...`);
    for (const tagData of mockTags as MockTag[]) {
      const orgId = orgIdMap.get(tagData.organization);
      const creatorId = userIdMap.get(tagData.creator);
      if (orgId && creatorId) {
        try {
          await pb.collection("tags").create({
            name: tagData.name,
            color: tagData.color,
            organization: orgId,
            creator: creatorId,
          });
          stats.tags++;
        } catch {
          // Skip errors
        }
      }
    }
    console.log(`✅ Created ${stats.tags} tags\n`);

    // Create notifications
    console.log(`🔔 Creating ${mockNotifications.length} notifications...`);
    for (const notificationData of mockNotifications as MockNotification[]) {
      const userId = userIdMap.get(notificationData.user);
      if (userId) {
        try {
          await pb.collection("notifications").create({
            user: userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            read: notificationData.read,
          });
          stats.notifications++;
        } catch {
          // Skip errors
        }
      }
    }
    console.log(`✅ Created ${stats.notifications} notifications\n`);

    // Print summary
    printSummary(stats);
  } catch (error: unknown) {
    console.error("\n❌ Setup failed:");
    if (error instanceof Error) {
      console.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

function printSummary(stats: SetupStats): void {
  console.log("=".repeat(60));
  console.log("✅ Setup completed successfully!");
  console.log("=".repeat(60));
  console.log("📊 Created:");
  console.log(`   • ${stats.organizations} organizations`);
  console.log(`   • ${stats.users} users`);
  console.log(`   • ${stats.projects} projects`);
  console.log(`   • ${stats.tasks} tasks`);
  console.log(`   • ${stats.comments} comments`);
  console.log(`   • ${stats.tags} tags`);
  console.log(`   • ${stats.notifications} notifications`);
  console.log("\n🔑 Login credentials:");
  console.log("   • Admin: admin@example.com / admin12345");
  console.log("   • Manager: manager@example.com / manager123");
  console.log("   • Supervisor: supervisor@example.com / supervisor123");
  console.log("   • Employee 1: employee1@example.com / employee123");
  console.log("   • Employee 2: employee2@example.com / employee123");
  console.log("=".repeat(60));
}

// Run setup if executed directly
if (import.meta.main) {
  setup();
}
