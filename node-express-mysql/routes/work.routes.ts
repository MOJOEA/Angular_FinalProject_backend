import { Router } from 'express';
import {
  getAllWorks,
  getWorkById,
  createWork,
  updateWorkById,
  clearAllWorks,
  deleteWorkById,
} from '../controller/work.controller';

const router = Router();

// GET
router.get('/', getAllWorks);        // GET api/work
router.get('/:id', getWorkById);     // GET api/work/:id

// POST
router.post('/', createWork);        // POST api/work
router.post('/single', updateWorkById); // POST api/work/:id

// DELETE (*** ต้องเรียง /clear ไว้ก่อน /:id ห้ามสลับกันเด็ดขาด ***)
router.delete('/clear', clearAllWorks);  // DELETE api/work/clear
router.delete('/:id', deleteWorkById);   // DELETE api/work/:id

export default router;