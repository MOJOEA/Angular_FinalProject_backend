import { Request, Response } from "express";
import { getAllRouteStops, getRouteStopsById, getRouteStopsByWorkId} from '../Service/route.service';
import { RouteStop } from '../Model/RouteStop.model';

export const ControllerGetRoutes = async (req: Request, res: Response) => {
    try {
        const routes: RouteStop[] = await getAllRouteStops();
        res.json({ success: true, data: routes});
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}

export const ControllerGetRoutesById = async (req: Request, res: Response) => {
    try {
        const Id: number = Number(req.params.id); 
        const route: RouteStop | null = await getRouteStopsById(Id);
        if (!route) {return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลเส้นทางนี้' });}
        res.json({ success: true, data: route });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}


export const ControllerGetRouteByWorkId = async (req: Request, res: Response) => {
    try {
        const workId: number = Number(req.params.id); 
        const routes: RouteStop[] = await getRouteStopsByWorkId(workId);
        res.json({ success: true, data: routes });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}

