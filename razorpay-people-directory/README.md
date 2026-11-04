# Razorpay AI-Assisted React Coding Assessment

Time box:

- **45 minutes:** AI-assisted coding
- **15 minutes:** machine-coding discussion without AI

You are working on an existing React frontend. Inspect it before you change it. The goal is a professional people directory that can manage the **existing 20,000 records** already in this project.

This assessment checks engineering fundamentals, planning, how you instruct an AI coding assistant, verification, debugging, and how well you can explain the result without AI.

## 1. Inspect the project first

Before writing or modifying feature code:

- Explore the folder structure.
- Read `package.json`, this README, the components, and the data files.
- Identify how the application is structured.
- Understand how the 20,000 people records are stored and accessed.
- Inspect the actual fields and data format.
- Identify which features already work and which are missing.
- Look for bugs, performance problems, and weak UI decisions.

The records live in this repository. Use them. Do not replace them with a different dataset (astronauts, employees from another domain, or randomly generated replacement data). Do not create a second dataset unless you discover that `src/data/people.json` is missing. If something about the data is unclear, write down what you found before assuming a schema.

Preserve behavior that already works unless a change is required to complete the assessment.

## 2. Objective

Build a professional, responsive React application that lets a user manage these 20,000 people records efficiently.

The result should feel like a product, not a bare CRUD form.

Show:

- Solid React fundamentals
- Clear component boundaries
- Deliberate state management
- Create, read, update, and delete
- Search, filtering, and sorting
- Performance suitable for 20,000 records
- Accessible, understandable UI
- Validation and error handling
- Code that another engineer can maintain

## 3. Technology limits

Stay on the stack that is already set up.

- React
- JavaScript
- Vite
- CSS

This is a **frontend-only** exercise.

Do not add a backend, database, or extra libraries unless you can justify why the current setup cannot do the job. Do not replace Vite, React, or the data file without a clear technical reason.

You may use an AI coding assistant during the 45-minute build. You may not use one during the 15-minute discussion.

## 4. Use the existing 20,000 records

- Inspect `src/data/people.json` and use its real fields.
- Show those records in the UI.
- Do not change the field names unless a change is necessary and documented.
- Keep create, edit, and delete consistent with that shape.
- Keep the existing `id` values. New records need ids that will not collide with existing ones.
- Handle blank or unexpected values without crashing.
- The UI must stay usable with all 20,000 records loaded.

`npm run generate-data` rewrites `src/data/people.json` from `scripts/generatePeople.mjs`. Use that only if the data file is missing. Do not regenerate the file as a shortcut to change the schema.

## 5. CRUD

### Create

- Add a person through a form or modal.
- Validate required fields.
- Validate email format when an email is entered.
- Block duplicate records where the data makes that meaningful.
- Show specific validation messages.
- Show the new record immediately.

### Read

- Show the records in a table, list, or directory.
- Choose columns from the real fields.
- Show a total count and a count of the current result set.
- Show an empty state when search or filters match nothing.

### Update

- Edit an existing record.
- Pre-fill the form with that record.
- Validate before saving.
- Update only the selected record.
- Editing one record must not change any other record.

### Delete

- Delete a record only after confirmation.
- Remove the correct record and update the list.

## 6. Search, filter, and sort

Base the controls on fields that actually exist. Do not add filters for fields that are not in the data.

### Search

- Search the fields that identify a person, such as name, email, or id, once you have confirmed those fields exist.
- Search should be case-insensitive.
- Results should update as the user types.
- Say clearly when nothing matches.

### Filtering

- Filter on the categorical fields present in the data.
- Let the user combine filters.
- Provide a way to clear search and filters.

### Sorting

- Sort by fields that make sense after you inspect the data, such as name or date.
- Support ascending and descending order.
- Sorting must compose correctly with search and filters.

## 7. Performance

The directory has to stay responsive with 20,000 records.

Inspect the current list before optimizing. Use a technique only when it solves a real cost, and be ready to explain that choice. Relevant tools include:

- `useMemo` for derived lists and counts
- `React.memo` where child re-renders are actually expensive
- `React.lazy` and `Suspense` if a split is worth it
- Pagination, incremental rendering, or virtualization
- Stable keys
- Immutable updates
- Debounced search, if measuring or reasoning shows it helps

Do not add every technique by default.

## 8. UI

Turn the current screen into a clear, responsive directory.

Include:

- A readable page hierarchy
- A layout that works on a desktop width and a narrow phone width
- Consistent spacing and type
- A clear record list
- A toolbar for search and filters
- Create and edit UI
- Delete confirmation
- Obvious primary and secondary actions
- Loading, empty, and error feedback where those states can happen
- Feedback after a successful or failed action
- Labels and keyboard access for form controls
- Contrast that is readable

Keep useful pieces of the current UI, including the sticky table header if you still use a table. Replace anything that is confusing, unfinished, or non-functional.

## 9. Code quality

- Prefer small components with one job.
- Keep data updates separate from presentational markup where that improves clarity.
- Use names that describe the domain.
- Do not leave placeholder buttons.
- Do not describe a control as done if it does not work.
- Match the existing JavaScript style unless you are fixing it.

## 10. Verify

Before you stop:

- Run the app with the scripts in `package.json`.
- Fix compile and runtime errors.
- Exercise create, edit, and delete.
- Use search, filters, and sort together.
- Try the full 20,000 records.
- Confirm an edit or delete touches only the intended record.
- Confirm validation and the empty state.
- Check a wide layout and a narrow layout.
- Check the browser console.

If you could not verify something, say so. Do not claim it works.

## 11. Update this README

Replace the assessment brief with a project README that covers:

- Project overview
- Assessment objective
- Data source and the real record fields
- Features you implemented
- Tech stack
- Project structure
- Install and run commands
- How create, read, update, and delete behave
- How search, filter, and sort behave
- Performance choices and why
- Important decisions
- Known limitations
- Steps you used to verify

## 12. What you should be able to explain

During the discussion, without AI, you should be able to explain and modify the code:

- How the records are loaded and held in state
- How each CRUD action updates that state
- How search, filters, and sort combine
- Which optimizations you used and which you skipped
- How you avoided extra re-renders
- Trade-offs you accepted
- Bugs you found and how you fixed them
- What you would improve with more time

## Commands

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Hand-in

Submit the project folder after the README has been rewritten for the implementation you actually shipped.
