import {
  ROLES,
  SEGMENTS,
  STATUSES,
  LOCATIONS,
} from "../../razorpay-people-directory/src/constants/peopleOptions.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SORT_FIELDS = new Set([
  "fullName",
  "id",
  "email",
  "phone",
  "role",
  "segment",
  "city",
  "status",
  "joinedOn",
]);
const PAGE_SIZES = new Set([25, 50, 100, 200]);

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildPeopleFilter(query) {
  const clauses = [];
  const q = String(query.q || "").trim();

  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    clauses.push({
      $or: [
        { fullName: pattern },
        { email: pattern },
        { id: pattern },
        { phone: pattern },
        { city: pattern },
      ],
    });
  }

  if (query.role) clauses.push({ role: String(query.role) });
  if (query.segment) clauses.push({ segment: String(query.segment) });
  if (query.city) clauses.push({ city: String(query.city) });

  if (query.status === "__unassigned__") {
    clauses.push({ $or: [{ status: "" }, { status: null }] });
  } else if (query.status) {
    clauses.push({ status: String(query.status) });
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export function parseListQuery(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || 25;
  const limit = PAGE_SIZES.has(requestedLimit)
    ? requestedLimit
    : Math.min(200, Math.max(1, requestedLimit));
  const sortField = SORT_FIELDS.has(query.sort) ? query.sort : "fullName";
  const direction = query.direction === "desc" ? -1 : 1;

  return { page, limit, sortField, direction };
}

export function validatePersonInput(body, { partial = false } = {}) {
  const errors = {};
  const data = {};

  const name = body.fullName === undefined ? undefined : String(body.fullName).trim();
  if (!partial || name !== undefined) {
    if (!name) errors.fullName = "Full name is required.";
    else if (name.length < 2) errors.fullName = "Full name must be at least 2 characters.";
    else data.fullName = name;
  }

  const email = body.email === undefined ? undefined : String(body.email).trim();
  if (!partial || email !== undefined) {
    if (email && !EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address (e.g., user@example.com).";
    } else if (email !== undefined) {
      data.email = email || "";
    }
  }

  const phone = body.phone === undefined ? undefined : String(body.phone).trim();
  if (!partial || phone !== undefined) {
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        errors.phone = "Phone number must contain between 7 and 15 digits.";
      } else {
        data.phone = phone;
      }
    } else if (phone !== undefined) {
      data.phone = "";
    }
  }

  if (!partial || body.role !== undefined) {
    if (!body.role || !ROLES.includes(body.role)) errors.role = "Please select a valid role.";
    else data.role = body.role;
  }

  if (!partial || body.segment !== undefined) {
    if (!body.segment || !SEGMENTS.includes(body.segment)) {
      errors.segment = "Please select a valid segment.";
    } else data.segment = body.segment;
  }

  if (!partial || body.status !== undefined) {
    if (!body.status || !STATUSES.includes(body.status)) {
      errors.status = "Please select a valid status.";
    } else data.status = body.status;
  }

  const cities = LOCATIONS.map((location) => location.city);
  if (!partial || body.city !== undefined) {
    if (!body.city || !cities.includes(body.city)) errors.city = "Please select a valid city.";
    else data.city = body.city;
  }

  if (!partial || body.state !== undefined) {
    const state = body.state === undefined ? "" : String(body.state).trim();
    if (!state) errors.state = "State is required.";
    else data.state = state;
  }

  if (!partial || body.joinedOn !== undefined) {
    if (!body.joinedOn || Number.isNaN(Date.parse(body.joinedOn))) {
      errors.joinedOn = body.joinedOn ? "Invalid date format." : "Joined date is required.";
    } else data.joinedOn = String(body.joinedOn);
  }

  if (body.id !== undefined) {
    const id = String(body.id).trim();
    if (!/^PPL-\d{6,}$/.test(id)) errors.id = "Record id must look like PPL-000001.";
    else data.id = id;
  }

  return { isValid: Object.keys(errors).length === 0, errors, data };
}
