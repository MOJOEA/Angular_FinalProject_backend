import express from "express";

import TestRoutes from "./routes/test.routes"; 
import SettingsRoutes from "./routes/settings.routes"; 
import RoutesStopRoutes from "./routes/route.routes"; 
import OrderRoutes from "./routes/order.routes";
import CustomerRoutes from "./routes/customer.routes";

export const app = express();

app.use(express.json());

app.use("/api/test", TestRoutes); 

app.use("/api/setting", SettingsRoutes);

app.use("/api/route", RoutesStopRoutes);

app.use("/api/order", OrderRoutes);

app.use("/api/customer", CustomerRoutes);//
