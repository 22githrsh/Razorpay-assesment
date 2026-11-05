import { ROLES, SEGMENTS, STATUSES, LOCATIONS } from "../constants/peopleOptions.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePerson(formData, existingPeople = [], isEdit = false) {
  const errors = {};

  // Full Name validation
  const name = (formData.fullName || "").trim();
  if (!name) {
    errors.fullName = "Full name is required.";
  } else if (name.length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  // Email validation (optional as per dataset, but validated if provided)
  const email = (formData.email || "").trim();
  if (email) {
    if (!EMAIL_REGEX.test(email)) {
      errors.email = "Please enter a valid email address (e.g., user@example.com).";
    } else {
      const normalizedEmail = email.toLowerCase();

      if (isEdit) {
        // If editing, find the original record to check if email was changed
        const currentRecord = existingPeople.find((p) => p.id === formData.id);
        const emailUnchanged =
          currentRecord &&
          (currentRecord.email || "").trim().toLowerCase() === normalizedEmail;

        // If the email was changed, check that the new email isn't taken
        if (!emailUnchanged) {
          const duplicate = existingPeople.find((p) => {
            if (p.id === formData.id) return false;
            return (p.email || "").trim().toLowerCase() === normalizedEmail;
          });

          if (duplicate) {
            errors.email = `Email is already in use by ${duplicate.fullName} (${duplicate.id}).`;
          }
        }
      } else {
        // Create mode: block if email already exists anywhere in the directory
        const duplicate = existingPeople.find(
          (p) => (p.email || "").trim().toLowerCase() === normalizedEmail
        );

        if (duplicate) {
          errors.email = `Email is already in use by ${duplicate.fullName} (${duplicate.id}).`;
        }
      }
    }
  }

  // Phone validation (optional, but checked if provided)
  const phone = (formData.phone || "").trim();
  if (phone) {
    // Strip non-digit characters to verify reasonable phone length
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.phone = "Phone number must contain between 7 and 15 digits.";
    }
  }

  // Role validation
  if (!formData.role || !ROLES.includes(formData.role)) {
    errors.role = "Please select a valid role.";
  }

  // Segment validation
  if (!formData.segment || !SEGMENTS.includes(formData.segment)) {
    errors.segment = "Please select a valid segment.";
  }

  // Status validation
  if (!formData.status || !STATUSES.includes(formData.status)) {
    errors.status = "Please select a valid status.";
  }

  // City validation
  const validCities = LOCATIONS.map((l) => l.city);
  if (!formData.city || !validCities.includes(formData.city)) {
    errors.city = "Please select a valid city.";
  }

  // State validation
  if (!formData.state || !formData.state.trim()) {
    errors.state = "State is required.";
  }

  // Joined On validation
  if (!formData.joinedOn) {
    errors.joinedOn = "Joined date is required.";
  } else {
    const timestamp = Date.parse(formData.joinedOn);
    if (Number.isNaN(timestamp)) {
      errors.joinedOn = "Invalid date format.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function generateNextId(people = []) {
  let maxIdNum = 0;
  for (const person of people) {
    if (person && person.id && person.id.startsWith("PPL-")) {
      const num = parseInt(person.id.replace("PPL-", ""), 10);
      if (!Number.isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }
  const nextNum = maxIdNum + 1;
  return `PPL-${String(nextNum).padStart(6, "0")}`;
}
