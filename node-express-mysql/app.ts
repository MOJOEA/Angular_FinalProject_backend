import express from "express";

import testRoutes from "./routes/test.routes"; 
import settingsRoutes from "./routes/settings.routes"; 
import billRoutes from "./routes/bill.routes"; 
import workRoutes from './routes/work.routes';

export const app = express();

app.use(express.json());

app.use("/api/test", testRoutes); 

app.use("/api/setting", settingsRoutes);

app.use("/api/bill", billRoutes); 

// นำไปใช้กับ prefix /api/work
app.use('/api/work', workRoutes);


