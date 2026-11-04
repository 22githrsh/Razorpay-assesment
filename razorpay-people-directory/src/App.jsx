import { useState } from "react";
import peopleData from "./data/people.json";
import "./App.css";

export default function App() {
  const [people, setPeople] = useState(peopleData);
  const [query, setQuery] = useState("");
  const [nameSort, setNameSort] = useState("asc");

  function handleSortByName() {
    const direction = nameSort === "asc" ? 1 : -1;
    people.sort((left, right) => left.fullName.localeCompare(right.fullName) * direction);
    setNameSort(nameSort === "asc" ? "desc" : "asc");
    setPeople(people);
  }

  const filtered = people.filter((person) => person.fullName.includes(query));

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Razorpay assessment</p>
          <h1>People Directory</h1>
        </div>
        <p className="count">{people.length} people</p>
      </header>

      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
        />
        <button type="button" onClick={handleSortByName}>
          Sort by name ({nameSort === "asc" ? "A-Z" : "Z-A"})
        </button>
        <button type="button">Add person</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>City</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((person, index) => (
              <tr key={index}>
                <td>{person.id}</td>
                <td>{person.fullName}</td>
                <td>{person.email}</td>
                <td>{person.city}</td>
                <td>{person.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
