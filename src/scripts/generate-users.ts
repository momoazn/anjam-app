import { faker } from "@faker-js/faker";
import { User } from "@/store/auth-store";

function generateUser(): User {
  return {
    id: faker.string.uuid(),
    username: faker.person.fullName(),
    role: faker.helpers.arrayElement(["admin", "supervisor", "employee"]),
  };
}

function generateUsers(count: number = 10): User[] {
  return Array.from({ length: count }, generateUser);
}

const users = generateUsers(10);
console.log(JSON.stringify(users, null, 2));
