# Instructor guide — do not give this file to the student

Hand the student only the `razorpay-people-directory` folder. Exclude `node_modules`, `dist`, and this file.

The workspace started empty, so there was no pre-existing people export to reuse. `src/data/people.json` is a fixed 20,000-record seed created for this assessment. The student README tells them to use that file and not replace it.

## How to run the starter

```bash
cd razorpay-people-directory
npm install
npm run dev
```

`npm run build` completes. The production bundle is about 4.8 MB because the JSON is imported into the client. That is expected for this starter.

## Record shape

Every record has these fields:

| Field | Example | Notes |
| --- | --- | --- |
| `id` | `PPL-000001` | Unique. 20,000 distinct ids. |
| `fullName` | `Sai Tiwari` | Always present. |
| `email` | `sai.tiwari.000001@example.com` | 30 records are blank. 12 emails are shared by two records. |
| `phone` | `+91 88132 99051` | 30 records are blank. |
| `city` | `Kochi` | 10 cities. |
| `state` | `Kerala` | Matches `city`. |
| `role` | `Partner` | Merchant, Partner, Customer, Finance Contact, Support Lead. |
| `segment` | `Individual` | Individual, Startup, SME, Enterprise. |
| `status` | `Active` | Active, Inactive, Pending. `PPL-000043` is blank. |
| `joinedOn` | `2023-05-28` | `YYYY-MM-DD`. |

Regenerate only if the JSON file is lost:

```bash
npm run generate-data
```

The generator uses a fixed seed, so the file comes back the same. Students who open `scripts/generatePeople.mjs` can see the planted blank values and duplicate emails. That is allowed. The interesting defects are in the UI.

### Planted data quirks

- `PPL-000001` through `PPL-000012` share emails with `PPL-008001` through `PPL-008012`.
- 30 blank emails, starting at `PPL-001201`, then every 23 ids.
- 30 blank phones, starting at `PPL-002401`, then every 29 ids.
- `PPL-000043` has an empty `status`.

A good solution treats email duplicates as a create/edit rule, not as something to delete automatically, and renders blank values without crashing.

## What the starter already does

`src/App.jsx` is one component.

- Loads `people.json` into React state.
- Renders id, name, email, city, and status for every record.
- Search box filters `fullName` only, and the match is case-sensitive (`includes`).
- Header count is always `people.length`, so search does not change it.
- Sort mutates the state array with `people.sort`, then calls `setPeople` with that same array. The label still updates because `nameSort` changes, so a re-render happens and the mutated order becomes visible.
- That sort also mutates the imported JSON module. A later reset that reuses the import will not restore the original order.
- Row keys are the array index.
- "Add person" has no click handler.
- There is no edit, delete, filter, empty state, or form validation.
- The table has a sticky header. The toolbar does not wrap, so a narrow viewport clips the actions.
- The search box has a placeholder and no label.

## What a solid 45-minute solution looks like

- Fields discovered from the JSON, not invented. Filters use real categories such as `role`, `segment`, `status`, and maybe `city`.
- Search is case-insensitive across name, email, and id.
- Search, filters, and sort all run on one derived list.
- Create and edit validate required name, unique id, and email format when an email is present. Duplicate emails are rejected or explicitly warned. Blank email stays allowed because the seed data has blanks.
- Edit pre-fills the selected record and updates that object only, immutably.
- Delete asks for confirmation and removes one id.
- The table does not mount 20,000 rows. Pagination is the simplest acceptable approach. Virtualization is stronger if they can explain it. Either is fine.
- Derived list and counts are memoized. `React.memo` is optional and only useful if a child is expensive. `React.lazy` is optional and easy to overuse here.
- Debouncing is optional. Filtering 20,000 small objects is cheap next to painting 20,000 rows. A good answer says pagination made debounce unnecessary.
- Empty search shows a message. The visible count and the total count are both on screen.
- Layout works around 375px and at desktop width.
- README describes the real schema, behavior, trade-offs, and what they actually ran.

## Likely mistakes

- Replacing `people.json` with a smaller fake list.
- Filtering only after pagination, so results are wrong.
- Sorting a copy of the current page instead of the filtered set.
- `setPeople(people)` or object mutation, so an edit leaks into another row.
- Using the row index as the key after sorting or deleting.
- Claiming virtualization while still rendering every row.
- Adding a library for a table they could paginate in plain React.

## 15-minute discussion, without AI

Use the code they wrote. If they stalled, use the starter.

1. Where does the initial array come from, and what breaks if a handler sorts it in place?
2. Change the count live so it shows the filtered size. They should do this without AI.
3. Ask them to search for `sai` versus `Sai` on the starter, then explain their own search.
4. Walk one create through validation, the id they generate, and the state update.
5. Ask which optimizations they skipped, and why painting rows mattered more than `useMemo`.
6. Ask how `PPL-000043` and a shared email should behave.
7. If time remains, ask them to fix a bug you introduce, such as a filter that ignores the selected status.

A passing discussion sounds like the student owns the data flow. Reading the README aloud, or being unable to find the state update, is a weak result.

## Suggested scores

| Area | Strong | Weak |
| --- | --- | --- |
| Uses the real 20,000 records and fields | Names the actual fields and edge cases | New dataset or guessed columns |
| CRUD | Validated, immutable, confirmed delete | Placeholder buttons or edits that copy onto other rows |
| Search, filter, sort | Combined and case-insensitive | One field, case-sensitive, or sort that ignores filters |
| Performance | Page or window, stable ids, can explain cost | Still mounts every row and calls it optimized |
| UI | Usable on a phone, empty and error feedback | Desktop-only table, no empty state |
| Verification | Ran the app and can show a failed case they fixed | Says it works and did not run it |
| Discussion | Can change a small piece of state live | Cannot trace a click to a state update |
