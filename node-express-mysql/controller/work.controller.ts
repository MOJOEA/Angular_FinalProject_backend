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

// PUT / POST api/work/:id (Update)
export const updateWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // 1. ดึงข้อมูลที่ส่งมาจาก Body (job_code, color, stops)

    // 2. เรียกใช้ Service สำหรับอัปเดต โดยส่งทั้ง id และ body ไป
    const updated = await workService.updateWorkByIdService(id as string, updateData);

    // 3. เช็กว่าหาข้อมูล ID นั้นเจอไหม
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    // 4. ส่ง Response ตอบกลับเมื่ออัปเดตสำเร็จ
    res.status(200).json({ 
      success: true, 
      message: 'Work updated successfully', 
      data: updated 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
// PUT /api/work/accept/:id
export const acceptWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const result = await workService.acceptWorkService(id); 

    // กรณีไม่พบงานในระบบ
    if (!result.found) {
      res.status(404).json({
        success: false,
        message: 'Work not found'
      });
      return;
    }

    // กรณียิงมาแล้วเป็น shipping อยู่แล้ว -> ไม่ต้องเปลี่ยน แจ้งว่าอยู่สถานะนี้แล้ว (ไม่ส่ง data)
    if (result.isAlreadyShipping) {
      res.status(200).json({
        success: true,
        message: 'Already in shipping'
      });
      return;
    }

    // กรณีเปลี่ยนเป็น shipping สำเร็จ -> แจ้งสำเร็จ (ไม่ส่ง data)
    res.status(200).json({
      success: true,
      message: 'Status updated to shipping'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

// PUT /api/work/logout/:id
export const logoutWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; 
    const result = await workService.logoutWorkService(id);

    // กรณีไม่พบงานในระบบ
    if (!result.found) {
      res.status(404).json({
        success: false,
        message: 'Work not found'
      });
      return;
    }

    // กรณีเปลี่ยนสถานะเป็น pending สำเร็จ -> แจ้งสำเร็จ (ไม่ส่ง data)
    res.status(200).json({
      success: true,
      message: 'Status updated to pending'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
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

export const deleteWorkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isDeleted = await workService.deleteWorkByIdService(id as string);

    // เช็กถ้าลบไม่สำเร็จ (affectedRows === 0)
    if (!isDeleted) {
      return res.status(404).json({ success: false, message: 'Work not found or already deleted' });
    }

    res.status(200).json({ success: true, message: 'Work deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

