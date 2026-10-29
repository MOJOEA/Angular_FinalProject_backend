import { Router } from 'express';
import { getAllWorks, getWorkById, clearAllWorks, deleteWorkById, acceptWork, logoutWork } from '../controller/work.controller';

import { ControllerCreatework } from "../controller/creatework/creatework.controller"; 

const router = Router();

// GET
router.get('/', getAllWorks);        // GET api/work
router.get("/creat", ControllerCreatework);
router.get('/:id', getWorkById);     // GET api/work/:id

// DELETE (*** ต้องเรียง /clear ไว้ก่อน /:id ห้ามสลับกันเด็ดขาด ***)
router.delete('/clear', clearAllWorks);  // DELETE api/work/clear
router.delete('/:id', deleteWorkById);   // DELETE api/work/:id

router.put('/accept/:id', acceptWork);  // PUT api/work/accept/:id
router.put('/logout/:id', logoutWork);  // PUT api/work/logout/:id

export default router;