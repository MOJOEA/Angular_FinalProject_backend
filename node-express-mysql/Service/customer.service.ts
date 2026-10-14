import { conn } from "../dbconnect";
import { Customer } from "../Model/Customer.model";

export const getCustomer = async (): Promise<Customer[]> => {
    const query = "SELECT * FROM `customer`";
    const [rows]: any = await conn.query(query);
    return rows as Customer[];
};