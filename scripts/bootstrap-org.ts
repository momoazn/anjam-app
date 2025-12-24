import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin12345";
const ORG_NAME = process.env.ORG_NAME || "Acme";
const ORG_DESCRIPTION = process.env.ORG_DESCRIPTION || "";

async function main() {
  const pb = new PocketBase(PB_URL);

  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

  const existingOrg = await pb
    .collection("organizations")
    .getFirstListItem(`name = "${ORG_NAME.replace(/"/g, '\\"')}"`)
    .catch(() => null);

  if (existingOrg) {
    console.log(`Organization already exists: ${existingOrg.id}`);
    return;
  }

  const org = await pb.collection("organizations").create({
    name: ORG_NAME,
    slug: ORG_NAME.toLowerCase().replace(/\s+/g, "-"),
    description: ORG_DESCRIPTION,
    active: true,
    plan: "free",
  });

  const users = await pb.collection("users").getList(1, 1, {
    sort: "created",
  });

  if (!users.items.length) {
    throw new Error("No users found to assign as org owner");
  }

  const owner = users.items[0];

  await pb.collection("organization_members").create({
    organization: org.id,
    user: owner.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  console.log(`Created org ${org.id} and owner ${owner.id}`);
}

main().catch((error) => {
  console.error("Bootstrap failed:", error);
  process.exit(1);
});
