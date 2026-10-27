import express from "express";
import cors from "cors";

import workRoutes from './routes/work.routes';
import TestRoutes from "./routes/test.routes"; 
import SettingsRoutes from "./routes/settings.routes"; 
import RoutesStopRoutes from "./routes/route.routes"; 
import OrderRoutes from "./routes/order.routes";
import CustomerRoutes from "./routes/customer.routes";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://angular-final-project-bice.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/test", TestRoutes); 
app.use("/api/setting", SettingsRoutes);
app.use("/api/route", RoutesStopRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/customer", CustomerRoutes);
app.use('/api/work', workRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running",
  });
});


// นำไปใช้กับ prefix /api/work
app.use('/api/work', workRoutes);


export default app;
