import * as turf from '@turf/turf';

import { Order } from "../../Model/Order.model";
import { Customer } from "../../Model/Customer.model";
import { Settings } from '../../Model/Settings.model';

import { PlanningOrder } from '../../Model/Works.model';
import { getOrder } from '../order.service';
import { getCustomer } from '../customer.service';
import { getSetting } from '../setting.service';


// ฟังก์ชันจำลองสำหรับทดสอบบันทึกข้อมูลลง DB
export async function addRouteStops(workId: number, order_id: number, customer_id: number, sequence_no: number): Promise<void> {
  console.log(`[Test DB] addRouteStops -> workId: ${workId}, order_id: ${order_id}, customer_id: ${customer_id}, sequence_no: ${sequence_no}`);
}

export class WorkOrderService {
  private depot!: { latitude: number; longitude: number };
  private maxOrdersPerWorkOrder = 3;
  constructor() {}

  public async generateWorkOrders(): Promise<void> {
    const [orders, customers, settings] = await Promise.all([getOrder(), getCustomer(), getSetting()]) as [Order[], Customer[], Settings];
    this.depot = { latitude: settings.shop_latitude, longitude: settings.shop_longitude };
    if (settings.max_orders_rider) {
      this.maxOrdersPerWorkOrder = settings.max_orders_rider;
    }
    const planningOrders = this.prepareOrders(orders, customers);
    if (planningOrders.length) {
      await this.distributeOrders(planningOrders);
    }
  }


  private prepareOrders(orders: Order[], customers: Customer[]): PlanningOrder[] {
    const customerMap = new Map(customers.map((c) => [c.customer_id, c]));
    const depotPoint = turf.point([this.depot.longitude, this.depot.latitude]);
    return orders
      .map((order) => {
        const customer = customerMap.get(order.customer_id);
        if (!customer) return null;
        const customerPoint = turf.point([customer.longitude, customer.latitude]);
        const distance = turf.distance(depotPoint, customerPoint, { units: 'kilometers' });
        const bearing = turf.bearing(depotPoint, customerPoint);
        return {
          ...order,
          ...customer,
          distanceFromDepot: distance,
          bearing,
          direction: this.getDirection(bearing),
        } as unknown as PlanningOrder;
      })
      .filter((o): o is PlanningOrder => o !== null)
      .sort((a, b) => a.distanceFromDepot - b.distanceFromDepot);
  }

    private async distributeOrders(orders: PlanningOrder[]): Promise<void> {
    const remainingOrders = [...orders];
    let workId = 1;
    while (remainingOrders.length) {
      const randomIndex = Math.floor(Math.random() * remainingOrders.length);
      const [seed] = remainingOrders.splice(randomIndex, 1) as [PlanningOrder];
      const currentWorkOrders: PlanningOrder[] = [seed];
      while (currentWorkOrders.length < this.maxOrdersPerWorkOrder && remainingOrders.length) {
        const index = this.findBestOrderIndex(currentWorkOrders, remainingOrders);
        if (index === -1) break;
        const [nextOrder] = remainingOrders.splice(index, 1) as [PlanningOrder];
        currentWorkOrders.push(nextOrder);
      }
      for (let i = 0; i < currentWorkOrders.length; i++) {
        const order = currentWorkOrders[i];
        if (order) {
          await addRouteStops(workId, order.order_id, order.customer_id, i + 1);
        }
      }
      workId++;
    }
  }


  private findBestOrderIndex(currentOrders: PlanningOrder[], remainingOrders: PlanningOrder[]): number {
    if (remainingOrders.length === 0) return -1;
    const customers = new Set(currentOrders.map(o => o.customer_id));
    const directions = new Set(currentOrders.map(o => o.direction));
    const avgBearing = this.calculateAverageBearing(currentOrders);
    const avgDistance = currentOrders.reduce((sum, o) => sum + o.distanceFromDepot, 0) / currentOrders.length;
    let bestIndex = 0;
    for (let i = 1; i < remainingOrders.length; i++) {
      // แก้จุดแดงบรรทัด 110 ด้วยการใส่เครื่องหมาย ! ยืนยันข้อมูลใน Array
      if (this.isBetterOrder(remainingOrders[i]!, remainingOrders[bestIndex]!, customers, directions, avgBearing, avgDistance)) {
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  private isBetterOrder(current: PlanningOrder, best: PlanningOrder, customers: Set<number>, directions: Set<string>, averageBearing: number, averageDistance: number): boolean {
    if (customers.has(current.customer_id) !== customers.has(best.customer_id)) return customers.has(current.customer_id);
    if (directions.has(current.direction) !== directions.has(best.direction)) return directions.has(current.direction);
    const diffCurrent = Math.abs(averageBearing - current.bearing);
    const diffBest = Math.abs(averageBearing - best.bearing);
    const currentBearing = Math.min(diffCurrent, 360 - diffCurrent);
    const bestBearing = Math.min(diffBest, 360 - diffBest);
    if (currentBearing !== bestBearing) return currentBearing < bestBearing;
    return Math.abs(averageDistance - current.distanceFromDepot) < Math.abs(averageDistance - best.distanceFromDepot);
  }

  private getDirection(bearing: number): string {
    const positiveBearing = bearing < 0 ? bearing + 360 : bearing;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    // แก้จุดแดงบรรทัด 131 ด้วยการบีบค่าให้กลับมาเป็นสติงแน่นอนด้วย as string
    return directions[Math.round(positiveBearing / 45) % 8] as string;
  }

  private calculateAverageBearing(orders: PlanningOrder[]): number {
    if (orders.length === 0) return 0;
    const points = orders.map(o => turf.point([o.longitude, o.latitude]));
    const centerPoint = turf.center(turf.featureCollection(points));
    return turf.bearing(turf.point([this.depot.longitude, this.depot.latitude]), centerPoint);
  }
}
