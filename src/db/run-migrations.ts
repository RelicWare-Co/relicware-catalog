import { migrateDb } from "./index";

await migrateDb();

console.log("Drizzle migrations applied.");
