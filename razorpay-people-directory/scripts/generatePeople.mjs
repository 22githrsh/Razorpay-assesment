import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TOTAL = 20000;

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Ananya", "Diya", "Aadhya", "Pari", "Anika", "Navya",
  "Sara", "Myra", "Aanya", "Ira", "Rohan", "Kabir", "Dev", "Arnav", "Yash",
  "Meera", "Kiara", "Saanvi", "Avni", "Riya", "Neha", "Pooja", "Amit", "Suresh",
  "Lakshmi", "Karthik", "Divya", "Nikhil", "Priya", "Vikram", "Anjali", "Rahul",
  "Sneha", "Karan", "Isha", "Manish", "Tanvi", "Siddharth", "Kavya", "Farhan",
];

const lastNames = [
  "Sharma", "Verma", "Gupta", "Patel", "Reddy", "Iyer", "Nair", "Singh",
  "Khan", "Das", "Mehta", "Joshi", "Kapoor", "Malhotra", "Chopra", "Bose",
  "Banerjee", "Mukherjee", "Chatterjee", "Pillai", "Menon", "Rao", "Naidu",
  "Shetty", "Kulkarni", "Deshmukh", "Jain", "Agarwal", "Bansal", "Ghosh",
  "Sen", "Roy", "Mishra", "Pandey", "Tiwari", "Choudhary", "Yadav", "Kaur",
  "Gill", "Dutta",
];

const locations = [
  ["Bengaluru", "Karnataka"],
  ["Mumbai", "Maharashtra"],
  ["Delhi", "Delhi"],
  ["Hyderabad", "Telangana"],
  ["Chennai", "Tamil Nadu"],
  ["Pune", "Maharashtra"],
  ["Jaipur", "Rajasthan"],
  ["Ahmedabad", "Gujarat"],
  ["Kolkata", "West Bengal"],
  ["Kochi", "Kerala"],
];

const roles = ["Merchant", "Partner", "Customer", "Finance Contact", "Support Lead"];
const segments = ["Individual", "Startup", "SME", "Enterprise"];
const statuses = ["Active", "Inactive", "Pending"];

function mulberry32(seed) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function pad(value, size) {
  return String(value).padStart(size, "0");
}

function phoneNumber(rng) {
  const first = 6 + Math.floor(rng() * 4);
  let rest = "";
  for (let i = 0; i < 9; i += 1) rest += Math.floor(rng() * 10);
  return `+91 ${first}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function joinedOn(rng) {
  const start = Date.UTC(2016, 0, 1);
  const end = Date.UTC(2025, 11, 15);
  const stamp = start + Math.floor(rng() * (end - start));
  return new Date(stamp).toISOString().slice(0, 10);
}

const rng = mulberry32(20260314);
const people = [];

for (let index = 1; index <= TOTAL; index += 1) {
  const first = pick(rng, firstNames);
  const last = pick(rng, lastNames);
  const [city, state] = pick(rng, locations);
  const idNumber = pad(index, 6);

  people.push({
    id: `PPL-${idNumber}`,
    fullName: `${first} ${last}`,
    email: `${first}.${last}.${idNumber}@example.com`.toLowerCase(),
    phone: phoneNumber(rng),
    city,
    state,
    role: pick(rng, roles),
    segment: pick(rng, segments),
    status: pick(rng, statuses),
    joinedOn: joinedOn(rng),
  });
}

for (let i = 0; i < 12; i += 1) {
  people[8000 + i].email = people[i].email;
}

for (let i = 0; i < 30; i += 1) {
  people[1200 + i * 23].email = "";
}

for (let i = 0; i < 30; i += 1) {
  people[2400 + i * 29].phone = "";
}

people[42].status = "";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data");
const outFile = join(outDir, "people.json");
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(people));

const emails = new Map();
let duplicateEmails = 0;
let blankEmails = 0;
let blankPhones = 0;
let blankStatuses = 0;

for (const person of people) {
  if (!person.email) blankEmails += 1;
  else emails.set(person.email, (emails.get(person.email) || 0) + 1);
  if (!person.phone) blankPhones += 1;
  if (!person.status) blankStatuses += 1;
}

for (const count of emails.values()) {
  if (count > 1) duplicateEmails += 1;
}

console.log(`Wrote ${people.length} records to ${outFile}`);
console.log(
  `Shared emails: ${duplicateEmails}, blank emails: ${blankEmails}, blank phones: ${blankPhones}, blank statuses: ${blankStatuses}`,
);
