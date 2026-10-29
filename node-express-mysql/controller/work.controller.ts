import { Request, Response } from 'express';
import * as workService from '../Service/work.service';

// GET api/work
export const getAllWorks = async (req: Request, res: Response) => {
  try {
    const data = await workService.getAllWorksService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET api/work/:id
export const getWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await workService.getWorkByIdService(id as string);
    if (!data) return res.status(404).json({ success: false, message: 'Work not found' });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// GET api/work/accept/:id
export const acceptWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await workService.acceptWorkService(req.params.id as string);
    if (!result.found) {
      res.status(404).json({ success: false, message: 'Work not found' });
      return;
    }
    if (result.isAlreadyShipping) {
      res.status(200).json({ success: true, message: 'Already in shipping' });
      return;
    }
    res.status(200).json({ success: true, message: result.work_id });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// GET api/work/logout/:id
export const logoutWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await workService.logoutWorkService(req.params.id as string);
    if (!result.found) {
      res.status(404).json({ success: false, message: 'Work not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Status updated to pending' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// DET api/work/:id
export const clearAllWorks = async (req: Request, res: Response) => {
  try {
    await workService.clearAllWorksService();
    res.status(200).json({ success: true, message: 'All works cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ฟังก์ชัน: ลบงานตาม ID
export const deleteWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isDeleted = await workService.deleteWorkByIdService(id as string);
    if (!isDeleted) return res.status(404).json({ success: false, message: 'Work not found or already deleted' });
    res.status(200).json({ success: true, message: 'Work deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
