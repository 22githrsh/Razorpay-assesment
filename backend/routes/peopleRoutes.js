import { Router } from "express";
import {
  createPerson,
  deletePerson,
  getNextId,
  getPerson,
  listPeople,
  updatePerson,
} from "../controllers/peopleController.js";

const router = Router();

router.get("/", listPeople);
router.get("/next-id", getNextId);
router.get("/:id", getPerson);
router.post("/", createPerson);
router.put("/:id", updatePerson);
router.delete("/:id", deletePerson);

export default router;
