import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Person from "../models/Person.js";

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(
  __dirname,
  "../../razorpay-people-directory/src/data/people.json"
);

const BATCH_SIZE = 1000;

function toPerson(record) {
  return {
    id: record.id,
    fullName: record.fullName ?? "",
    email: record.email ?? "",
    phone: record.phone ?? "",
    city: record.city ?? "",
    state: record.state ?? "",
    role: record.role ?? "",
    segment: record.segment ?? "",
    status: record.status ?? "",
    joinedOn: record.joinedOn ?? "",
  };
}

async function seed() {
  if (!fs.existsSync(dataPath)) {
    console.error(`Seed file not found: ${dataPath}`);
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(dataPath, "utf8")).map(toPerson);
  await connectDB();

  let upserted = 0;
  let matched = 0;

  for (let index = 0; index < records.length; index += BATCH_SIZE) {
    const batch = records.slice(index, index + BATCH_SIZE);
    const result = await Person.bulkWrite(
      batch.map((person) => ({
        updateOne: {
          filter: { id: person.id },
          update: { $setOnInsert: person },
          upsert: true,
        },
      })),
      { ordered: false }
    );
    upserted += result.upsertedCount || 0;
    matched += result.matchedCount || 0;
  }

  const total = await Person.countDocuments();
  console.log(
    `Seed complete. File records: ${records.length}. Inserted: ${upserted}. Already present: ${matched}. Collection size: ${total}.`
  );
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
