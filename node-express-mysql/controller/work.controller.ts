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

// POST api/work
export const createWork = async (req: Request, res: Response) => {
  try {
    const data = await workService.createWorkService(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// POST api/work/:id (Update)
export const updateWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await workService.updateWorkByIdService(id as string, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Work not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// DET (DELETE) api/work/clear
export const clearAllWorks = async (req: Request, res: Response) => {
  try {
    await workService.clearAllWorksService();
    res.status(200).json({ success: true, message: 'All works cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// DET (DELETE) api/work/:id
export const deleteWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await workService.deleteWorkByIdService(id as string);
    if (!deleted) return res.status(404).json({ success: false, message: 'Work not found' });
    res.status(200).json({ success: true, message: 'Work deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};