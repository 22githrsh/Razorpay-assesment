import Person from "../models/Person.js";
import { buildPeopleFilter, parseListQuery, validatePersonInput } from "../utils/peopleQuery.js";

const COLLATION = { locale: "en", strength: 2, numericOrdering: true };

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

async function nextPersonId() {
  const latest = await Person.findOne({ id: /^PPL-\d+$/ })
    .collation(COLLATION)
    .sort({ id: -1 })
    .select("id")
    .lean();

  const current = latest?.id ? parseInt(latest.id.replace("PPL-", ""), 10) : 0;
  const nextNum = Number.isNaN(current) ? 1 : current + 1;
  return `PPL-${String(nextNum).padStart(6, "0")}`;
}

async function emailConflict(email, excludeId) {
  if (!email) return null;
  const owner = await Person.findOne({
    email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    ...(excludeId ? { id: { $ne: excludeId } } : {}),
  })
    .select("id fullName email")
    .lean();
  return owner;
}

export const listPeople = asyncHandler(async (req, res) => {
  const { page, limit, sortField, direction } = parseListQuery(req.query);
  const filter = buildPeopleFilter(req.query);
  const hasFilter = Object.keys(filter).length > 0;

  const query = Person.find(filter)
    .collation(COLLATION)
    .sort({ [sortField]: direction, id: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("-_id")
    .lean();

  const filteredCountQuery = Person.countDocuments(filter);
  const totalCountQuery = hasFilter
    ? Person.countDocuments({})
    : Promise.resolve(null);

  const [data, filteredTotal, unfilteredTotal] = await Promise.all([
    query,
    filteredCountQuery,
    totalCountQuery,
  ]);

  const total = hasFilter ? unfilteredTotal : filteredTotal;

  res.json({
    data,
    page,
    limit,
    total,
    filteredTotal,
    totalPages: Math.max(1, Math.ceil(filteredTotal / limit)),
  });
});

export const getNextId = asyncHandler(async (_req, res) => {
  const id = await nextPersonId();
  res.json({ id });
});

export const getPerson = asyncHandler(async (req, res) => {
  const person = await Person.findOne({ id: req.params.id }).select("-_id").lean();
  if (!person) {
    res.status(404).json({ message: `No person found with id ${req.params.id}.` });
    return;
  }
  res.json(person);
});

export const createPerson = asyncHandler(async (req, res) => {
  const { isValid, errors, data } = validatePersonInput(req.body);
  if (!isValid) {
    res.status(400).json({ message: "Person could not be created.", errors });
    return;
  }

  data.id = data.id || (await nextPersonId());
  const duplicate = await emailConflict(data.email);
  if (duplicate) {
    res.status(409).json({
      message: "Email is already in use.",
      errors: {
        email: `Email is already in use by ${duplicate.fullName} (${duplicate.id}).`,
      },
    });
    return;
  }

  try {
    const created = await Person.create(data);
    res.status(201).json(created.toJSON());
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        message: "A person with this id already exists.",
        errors: { id: "Record id is already in use." },
      });
      return;
    }
    throw error;
  }
});

export const updatePerson = asyncHandler(async (req, res) => {
  const current = await Person.findOne({ id: req.params.id });
  if (!current) {
    res.status(404).json({ message: `No person found with id ${req.params.id}.` });
    return;
  }

  const { isValid, errors, data } = validatePersonInput(req.body);
  if (!isValid) {
    res.status(400).json({ message: "Person could not be updated.", errors });
    return;
  }

  delete data.id;

  const nextEmail = data.email ?? current.email;
  const emailUnchanged =
    String(current.email || "").trim().toLowerCase() ===
    String(nextEmail || "").trim().toLowerCase();

  if (nextEmail && !emailUnchanged) {
    const duplicate = await emailConflict(nextEmail, current.id);
    if (duplicate) {
      res.status(409).json({
        message: "Email is already in use.",
        errors: {
          email: `Email is already in use by ${duplicate.fullName} (${duplicate.id}).`,
        },
      });
      return;
    }
  }

  Object.assign(current, data);
  const saved = await current.save();
  res.json(saved.toJSON());
});

export const deletePerson = asyncHandler(async (req, res) => {
  const deleted = await Person.findOneAndDelete({ id: req.params.id }).select("id fullName").lean();
  if (!deleted) {
    res.status(404).json({ message: `No person found with id ${req.params.id}.` });
    return;
  }
  res.json({
    message: `Deleted record for ${deleted.fullName} (${deleted.id}).`,
    id: deleted.id,
  });
});
