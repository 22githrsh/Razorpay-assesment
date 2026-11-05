import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    segment: { type: String, default: "", trim: true },
    status: { type: String, default: "" },
    joinedOn: { type: String, default: "" },
  },
  {
    collection: "people",
    versionKey: false,
  }
);

personSchema.index({ email: 1 });
personSchema.index({ role: 1 });
personSchema.index({ segment: 1 });
personSchema.index({ status: 1 });
personSchema.index({ city: 1 });
personSchema.index({ fullName: 1 });
personSchema.index({ joinedOn: 1 });

const COLLATION = { locale: "en", strength: 2 };

personSchema.set("toJSON", {
  virtuals: false,
  transform(_doc, ret) {
    delete ret._id;
    return ret;
  },
});

personSchema.statics.publicCollation = COLLATION;

const Person = mongoose.model("Person", personSchema);

export default Person;
