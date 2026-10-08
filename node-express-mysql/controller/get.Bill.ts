import express, { Request, Response } from "express";
import { conn } from '../dbconnect';

export const getBill = async (req: Request, res: Response) => {
    const { id } = req.params; 
    res.send(`get bill id: ${id}`);
}

export const getBills = async (req: Request, res: Response) => {
    res.send("get all bill");
}
