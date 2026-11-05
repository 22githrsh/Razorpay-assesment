const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors || {};
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("Cannot reach the people API. Start the backend and try again.", 0);
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(body?.message || "Request failed.", response.status, body?.errors);
  }

  return body;
}

export function fetchPeople(params, signal) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      search.set(key, String(value));
    }
  });
  return request(`/people?${search.toString()}`, { signal });
}

export function fetchNextId() {
  return request("/people/next-id");
}

export function createPerson(person) {
  return request("/people", {
    method: "POST",
    body: JSON.stringify(person),
  });
}

export function updatePerson(id, person) {
  return request(`/people/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(person),
  });
}

export function deletePerson(id) {
  return request(`/people/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
