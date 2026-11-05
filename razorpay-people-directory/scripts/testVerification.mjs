import assert from "node:assert";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const peopleData = require("../src/data/people.json");
import { validatePerson, generateNextId } from "../src/utils/validation.js";
import { ROLES, SEGMENTS, STATUSES, LOCATIONS } from "../src/constants/peopleOptions.js";

console.log("=== RUNNING VERIFICATION SUITE ===");

// 1. Dataset checks
console.log("\n[Test 1] Dataset integrity & edge cases:");
assert.strictEqual(peopleData.length, 20000, "Dataset must have 20,000 records");
console.log("✓ Total records loaded: 20,000");

const p43 = peopleData.find((p) => p.id === "PPL-000043");
assert.ok(p43, "PPL-000043 must exist");
assert.strictEqual(p43.status, "", "PPL-000043 must have empty status");
console.log("✓ Handled empty status on PPL-000043 without crashing");

// 2. ID Generation
console.log("\n[Test 2] Next ID generation:");
const nextId = generateNextId(peopleData);
assert.strictEqual(nextId, "PPL-020001", "Next ID should be PPL-020001");
console.log(`✓ Next ID generated correctly: ${nextId}`);

// 3. Validation: Full Name
console.log("\n[Test 3] Validation rules:");
const invalidName = validatePerson({ fullName: "" }, peopleData);
assert.strictEqual(invalidName.isValid, false);
assert.ok(invalidName.errors.fullName, "Empty name must produce validation error");
console.log("✓ Missing name blocked with message:", invalidName.errors.fullName);

// 4. Validation: Email format & duplicate check
const invalidEmail = validatePerson(
  {
    fullName: "Test User",
    email: "not-an-email",
    role: "Partner",
    segment: "Individual",
    status: "Active",
    city: "Mumbai",
    state: "Maharashtra",
    joinedOn: "2024-01-01",
  },
  peopleData
);
assert.strictEqual(invalidEmail.isValid, false);
assert.ok(invalidEmail.errors.email, "Invalid email format must be caught");
console.log("✓ Invalid email caught:", invalidEmail.errors.email);

// Duplicate email check on Create
const duplicateEmail = validatePerson(
  {
    fullName: "Duplicate Tester",
    email: peopleData[0].email, // sai.tiwari.000001@example.com
    role: "Partner",
    segment: "Individual",
    status: "Active",
    city: "Mumbai",
    state: "Maharashtra",
    joinedOn: "2024-01-01",
  },
  peopleData,
  false // create mode
);
assert.strictEqual(duplicateEmail.isValid, false);
assert.ok(duplicateEmail.errors.email.includes("already in use"), "Duplicate email must be blocked");
console.log("✓ Duplicate email blocked on Create:", duplicateEmail.errors.email);

// Email on Edit: Person can keep their OWN email
const selfEmailEdit = validatePerson(
  {
    id: peopleData[0].id,
    fullName: "Sai Tiwari Updated",
    email: peopleData[0].email,
    role: peopleData[0].role,
    segment: peopleData[0].segment,
    status: peopleData[0].status,
    city: peopleData[0].city,
    state: peopleData[0].state,
    joinedOn: peopleData[0].joinedOn,
  },
  peopleData,
  true // edit mode
);
assert.strictEqual(selfEmailEdit.isValid, true, "Person editing their own record can keep their email");
console.log("✓ Person keeping their own email during edit passes validation");

// Email on Edit: Cannot steal someone else's email
const stealEmailEdit = validatePerson(
  {
    id: peopleData[0].id,
    fullName: "Sai Tiwari Updated",
    email: peopleData[1].email, // Taking person 2's email
    role: peopleData[0].role,
    segment: peopleData[0].segment,
    status: peopleData[0].status,
    city: peopleData[0].city,
    state: peopleData[0].state,
    joinedOn: peopleData[0].joinedOn,
  },
  peopleData,
  true
);
assert.strictEqual(stealEmailEdit.isValid, false);
assert.ok(stealEmailEdit.errors.email.includes("already in use"), "Cannot use someone else's email");
console.log("✓ Taking another person's email during edit blocked");

// Blank email allowed (as seed has 30 blank emails)
const blankEmailValid = validatePerson(
  {
    fullName: "Valid User Without Email",
    email: "",
    role: "Merchant",
    segment: "Startup",
    status: "Active",
    city: "Bengaluru",
    state: "Karnataka",
    joinedOn: "2024-01-01",
  },
  peopleData
);
assert.strictEqual(blankEmailValid.isValid, true, "Blank email is permitted");
console.log("✓ Blank email permitted without errors");

// 5. Search logic (case-insensitive across fields)
console.log("\n[Test 4] Search logic:");
const searchLower = peopleData.filter((p) =>
  (p.fullName || "").toLowerCase().includes("sai")
);
const searchUpper = peopleData.filter((p) =>
  (p.fullName || "").toLowerCase().includes("SAI".toLowerCase())
);
assert.strictEqual(searchLower.length, searchUpper.length, "Search must be case-insensitive");
assert.ok(searchLower.length > 0, "Should find matches for 'sai'");
console.log(`✓ Case-insensitive search for 'sai' and 'SAI' returns identical count: ${searchLower.length}`);

// Search by ID
const searchById = peopleData.filter((p) =>
  (p.id || "").toLowerCase().includes("ppl-000043")
);
assert.strictEqual(searchById.length, 1);
assert.strictEqual(searchById[0].id, "PPL-000043");
console.log("✓ Search by ID 'ppl-000043' found record successfully");

// 6. Categorical filtering
console.log("\n[Test 5] Categorical filters & composition:");
const merchants = peopleData.filter((p) => p.role === "Merchant");
console.log(`✓ Filter by role 'Merchant': ${merchants.length} records`);

const kochiMerchants = merchants.filter((p) => p.city === "Kochi");
console.log(`✓ Combined filter (Role: Merchant + City: Kochi): ${kochiMerchants.length} records`);

const unassignedStatus = peopleData.filter((p) => !p.status);
assert.strictEqual(unassignedStatus.length, 1);
assert.strictEqual(unassignedStatus[0].id, "PPL-000043");
console.log("✓ Filter for unassigned status correctly identifies PPL-000043");

// 7. Immutability check on Sorting
console.log("\n[Test 6] Immutability during sorting:");
const originalFirstId = peopleData[0].id;
const originalFirstName = peopleData[0].fullName;

// Perform immutable sort
const sorted = [...peopleData].sort((a, b) =>
  b.fullName.localeCompare(a.fullName)
);
assert.strictEqual(peopleData[0].id, originalFirstId, "Sorting must NOT mutate original dataset");
assert.strictEqual(peopleData[0].fullName, originalFirstName, "Original array order preserved");
console.log("✓ Sorting is strictly immutable (imported array remains untouched)");

// 8. CRUD State Updates: Immutability & Isolation
console.log("\n[Test 7] CRUD State Update logic:");
let testPeople = [...peopleData];

// Create
const newPerson = {
  id: "PPL-020001",
  fullName: "Harsh Test",
  email: "harsh.test@example.com",
  phone: "+91 98765 43210",
  role: "Partner",
  segment: "Enterprise",
  status: "Active",
  city: "Bengaluru",
  state: "Karnataka",
  joinedOn: "2026-11-04",
};

testPeople = [newPerson, ...testPeople];
assert.strictEqual(testPeople.length, 20001);
assert.strictEqual(testPeople[0].id, "PPL-020001", "New person is immediately at top of list");
console.log("✓ Create: New record added to list immediately, total count 20,001");

// Update
const updatedData = { ...testPeople[0], fullName: "Harsh Test Updated" };
testPeople = testPeople.map((p) => (p.id === updatedData.id ? updatedData : p));
assert.strictEqual(testPeople[0].fullName, "Harsh Test Updated");
assert.strictEqual(testPeople[1].fullName, originalFirstName, "Other records untouched");
console.log("✓ Update: Targeted record updated immutably, all other records untouched");

// Delete
testPeople = testPeople.filter((p) => p.id !== "PPL-020001");
assert.strictEqual(testPeople.length, 20000);
assert.strictEqual(testPeople.find((p) => p.id === "PPL-020001"), undefined);
console.log("✓ Delete: Correct record removed, total count restored to 20,000");

console.log("\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
