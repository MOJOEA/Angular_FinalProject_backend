import express from "express";

import testRoutes from "./routes/test.routes"; 
import billRoutes from "./routes/bill.routes"; 

export const app = express();

app.use(express.json());

app.use("/api/test", testRoutes); 

app.use("/api/bill", billRoutes); 


