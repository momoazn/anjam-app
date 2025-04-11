import { faker } from "@faker-js/faker";
import { Task } from "../store/task-store";

const priorities = ["low", "medium", "high", "urgent"] as const;
const statuses = ["todo", "in_progress", "done", "canceled"] as const;
const departments = [
  "IT",
  "HR",
  "Security",
  "Network",
  "Development",
  "Operations",
];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateComment(): Task["comments"][0] {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    content: faker.lorem.sentence(),
    createdAt: faker.date.recent().toISOString(),
  };
}

function generateTask(): Task {
  const createdAt = faker.date.recent({ days: 10 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

  return {
    id: `TSK-${faker.number.int({ min: 1, max: 999 })}`,
    title:
      capitalize(faker.hacker.verb()) +
      " " +
      capitalize(faker.hacker.adjective()) +
      " " +
      capitalize(faker.hacker.noun()),
    description: capitalize(faker.lorem.paragraph()),
    assignedUser: faker.string.uuid(),
    department: faker.helpers.arrayElement(departments),
    priority: faker.helpers.arrayElement(priorities),
    status: faker.helpers.arrayElement(statuses),
    deadline: faker.date.soon({ days: 15 }).toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    tags: faker.helpers.arrayElements(
      ["security", "devops", "training", "urgent", "frontend", "backend"],
      faker.number.int({ min: 0, max: 4 }),
    ),
    comments: faker.helpers.multiple(generateComment, {
      count: faker.number.int({ min: 0, max: 3 }),
    }),
  };
}

function generateTasks(count: number = 30): Task[] {
  return Array.from({ length: count }, generateTask);
}

// Generate and print
const tasks = generateTasks(30);
console.log(JSON.stringify(tasks, null, 2));
