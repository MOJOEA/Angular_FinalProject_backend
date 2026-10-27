# Angular Final Project Backend

ระบบ Backend API สำหรับจัดการข้อมูลลูกค้า (Customer), รายการสั่งซื้อ (Order), การตั้งค่าระบบ (Setting), เส้นทางขนส่ง (Route) และระบบบริหารงาน (Work) พร้อมระบบค้นหาพิกัดตำแหน่ง (Geospatial Query)

* **Base URL:** `https://angular-final-project-backend.vercel.app`

---

## Business Context & ปัญหาหลังบ้าน (สรุปพอสังเขป)

ระบบ Backend นี้ถูกพัฒนาขึ้นมาเพื่อแก้ปัญหาวิกฤตของร้าน **"ข้าวกล่องเดลิเวอรี ส่งด่วนมื้อเที่ยง"** แถวมหาวิทยาลัยมหาสารคาม (มมส) ซึ่งประสบปัญหาหลักในการจัดส่งอาหารในโหมด "เวลาจำกัด" โดยมีเงื่อนไขและข้อจำกัดทางธุรกิจที่ระบบหลังบ้านต้องคำนวณและตอบโจทย์ดังนี้:

* **เงื่อนไขเวลาและออเดอร์:** ออเดอร์หลั่งไหลเข้ามารอบเที่ยง 20-30 รายการ (รายการละไม่เกิน 3 กล่อง) ในรัศมี 3 กิโลเมตร อาหารทำเสร็จแพ็กใส่รถตอน 11:30 น. และ**ต้องส่งถึงมือลูกค้าทุกคนภายใน 1 ชั่วโมง (ไม่เกิน 12:30 น.)** หากเลทแม้แต่นาทีเดียวจะเสียลูกค้าทันที
* **ข้อจำกัดของไรเดอร์:** ไรเดอร์ขับรถด้วยความเร็วเฉลี่ย 30 กม./ชม. โดยมีข้อตกลงร่วมกันคือ **ไรเดอร์ 1 คน จะรับงานไม่เกินคนละ 3 ออเดอร์เท่านั้น** เพื่อไม่ให้จุดส่งเยอะเกินไป
* **เงื่อนไขต้นทุนและค่าส่ง:** ข้าวกล่องราคา 65 บาท (ต้นทุนอาหาร 40 บาท) มีค่าเรียกไรเดอร์พื้นฐาน 15 บาท/ครั้ง และคิดเพิ่มตามระยะทางกิโลเมตรละ 2 บาท ต่อ 1 กล่องที่นำไปส่ง (คิดตามจำนวนกล่อง x ระยะทางรวม) 

### สิ่งที่ระบบ (Backend) ต้องช่วยแก้ไข:
1. **จัดเส้นทางขนส่งที่สั้นที่สุด (Geospatial Optimization):** คำนวณหาเส้นทางบินหรือเส้นทางวิ่งที่มีระยะทางรวมสั้นที่สุด/ใช้เวลาน้อยที่สุด เพื่อไม่ให้ไรเดอร์วิ่งไขว้กันไปมาจนร้านขาดทุนค่าส่ง 
2. **จับคู่กระจายงาน (Work Allocation):** แบ่งกระจายออเดอร์ให้ไรเดอร์แต่ละคนแบบอัตโนมัติภายใต้เงื่อนไขคนละไม่เกิน 3 ออเดอร์ และคำนวณสรุปภาพรวมกำไร-ขาดทุน รวมถึงเวลาที่ใช้ส่ง เพื่อให้เจ้าของร้านกดคำนวณใหม่ได้หากผลลัพธ์ยังไม่น่าพึงพอใจ
3. **จัดลำดับจุดส่งให้ไรเดอร์:** วางแผนลำดับจุดส่ง 1 -> 2 -> 3 ให้ไรเดอร์เปิดดูผ่านมือถือและกดลิงก์แผนที่ขับตามได้ทันที

---

## Tech Stack & Tools (เครื่องมือที่เลือกใช้)

* **Runtime Environment:** Node.js (v18+) ร่วมกับ TypeScript
* **Backend Framework:** Express.js สำหรับการสร้าง RESTful API ที่รวดเร็วและยืดหยุ่น
* **Primary Database (Cloud):** **Aiven Cloud MySQL** ทำหน้าที่เป็นฐานข้อมูลหลักของระบบในการจัดเก็บข้อมูลชุดคำสั่งซื้อ ข้อมูลตำแหน่ง และตั้งค่าระบบแบบ Real-time บนคลาวด์
* **Local Database / Container:** Docker & Docker Compose (สำหรับรัน MySQL Container สำรองในเครื่องคอมพิวเตอร์ผู้พัฒนาผ่านเซ็ตติ้งโฟลเดอร์ `logitrack-docker`)
* **Deployment:** Vercel (รองรับการ Deploy ผ่านไฟล์เซ็ตติ้ง `vercel.json`)

---

## Project Structure (โครงสร้างโปรเจกต์)

โปรเจกต์นี้ใช้สถาปัตยกรรมแบบ **MVC (Model-View-Controller) / Service Layers** ร่วมกับการแยกส่วนพัฒนาแบบ Monorepo เบื้องต้น:

```text
Angular_FinalProject_backend/
├── logitrack-docker/           # โฟลเดอร์ติดตั้ง Docker สำหรับรัน Environment จำลอง
│   └── docker-compose.yml      # ไฟล์คอนฟิก Docker Compose สำหรับรัน MySQL ท้องถิ่น
├── node-express-mysql/         # ซอร์สโค้ดหลักของฝั่ง Backend (Node.js + Express + TS)
│   ├── config/                 # ไฟล์ตั้งค่าระบบและการเชื่อมต่อฐานข้อมูล
│   ├── controller/             # ส่วนควบคุม Request และจัดการ Response กลับไปยังผู้ใช้
│   ├── log/                    # โฟลเดอร์เก็บประวัติบันทึกการทำงานของระบบ (Log files)
│   ├── Model/                  # โครงสร้างและข้อมูล Data Schema ของตารางในฐานข้อมูล
│   ├── routes/                 # แผนผังเส้นทางและ URL Endpoints ของแอปพลิเคชัน
│   ├── Service/                # ส่วนคำนวณ Business Logic (ระบบคำนวณเส้นทางและคำนวณต้นทุน)
│   ├── .env                    # ไฟล์เก็บความลับระบบและ URI เชื่อมต่อไปยัง Cloud Aiven
│   ├── app.ts                  # ไฟล์เริ่มต้นติดตั้งการทำงานและ Middlewares ของแอป
│   ├── dbconnect.ts            # ไฟล์คำสั่งสำหรับสร้าง Connection Pool ไปยัง Aiven
│   ├── server.ts               # ไฟล์สั่งรันและเปิด Port บริการสำหรับ Server
│   ├── tsconfig.json           # คอนฟิกการทำงานและการคอมไพล์โค้ดของ TypeScript
│   └── vercel.json             # คอนฟิกสำหรับการนำระบบขึ้นใช้งานบน Vercel Production
├── package.json                # ไฟล์บันทึก Dependencies และสคริปต์สั่งรันฝั่ง Backend
└── README.md                   # เอกสารแนะนำและคู่มือการใช้งานระบบชิ้นนี้
```

---

## How to Run (คำสั่งการติดตั้งและรันระบบ)

### 1. การเตรียมความพร้อมและตั้งค่า Environment Variables
สร้างไฟล์ `.env` ไว้ในโฟลเดอร์หลักของโปรเจกต์หลังบ้านเพื่อเชื่อมต่อกับ **Aiven Database** โดยระบุค่าดังนี้:
```env
DB_HOST=://aivencloud.com
DB_PORT=5000
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_DATABASE=your_database_name
DB_MAX_CONNECTIONS=your_aiven_port
```

### 2. การสั่งรันฝั่ง Backend (API)
เปิด Terminal ไปที่โฟลเดอร์หลังบ้าน จากนั้นสั่งรันดังนี้:
```bash
# ติดตั้งโมดูลและไลบรารีที่จำเป็น
npm install

# รันระบบ Backend ในโหมดพัฒนา
npm run dev
```
*ระบบ Backend จะเปิดใช้งานและสแตนด์บายรับคำสั่งอยู่ที่: `http://localhost:5000`*

### 3. การสั่งรันฝั่ง Frontend (Angular User Interface)
เปิดหน้าต่าง Terminal บานใหม่เพื่อสั่งรันหน้าเว็บสำหรับแสดงผลแผนที่และตัวจัดสรรงาน:
```bash
# ย้ายโฟลเดอร์ไปยังส่วนติดต่อผู้ใช้งาน
cd angular-ui

# สั่งเริ่มใช้งานระบบ Frontend 
npm start
```
*ระบบ Frontend จะเปิดใช้งานผ่านเว็บเบราว์เซอร์หลักอยู่ที่ Port 3000: `http://localhost:3000`*

---

## API Endpoints Summary

### 1. General API

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | ตรวจสอบสถานะการทำงานของ Backend | - |

### 2. Customer API (ระบบจัดการข้อมูลลูกค้า) - `/api/customer`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ดึงข้อมูล / ค้นหาลูกค้า | `name`, `limit`, `lat` & `lng` (หารัศมี 1 กม.) |
| `GET` | `/:id` | ดึงข้อมูลลูกค้าผ่าน ID | - |
| `POST` | `/` | เพิ่มข้อมูลลูกค้าใหม่ | `{ customer_name, phone_number, location_name, latitude, longitude }` |
| `PUT` | `/:id` | แก้ไขข้อมูลลูกค้า | `{ customer_name, phone_number, location_name, latitude, longitude }` |
| `DELETE` | `/:id` | ลบข้อมูลลูกค้า | - |

### 3. Order API (ระบบจัดการรายการสั่งซื้อ) - `/api/order`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ดึงข้อมูลรายการสั่งซื้อ | `limit`, `lat` & `lng` (หารัศมี 2 กม.) |
| `GET` | `/:id` | ดึงข้อมูลรายการสั่งซื้อผ่าน ID | - |
| `POST` | `/` | เพิ่มรายการสั่งซื้อใหม่ | `{ customer_id, box_count, order_note }` |
| `POST` | `/test` | จำลองข้อมูลเข้าระบบ (Mock) | *ล้างข้อมูลเก่าอัตโนมัติ แล้วสร้างใหม่ 20-30 รายการ* |
| `PUT` | `/:id` | แก้ไขข้อมูลรายการสั่งซื้อ | `{ box_count, order_note, status }` |
| `DELETE` | `/:id` | ลบรายการสั่งซื้อผ่าน ID | - |
| `DELETE` | `/clear` | ล้างข้อมูลรายการสั่งซื้อทั้งหมด | *ลบข้อมูลคำสั่งซื้อทั้งหมดออกจากฐานข้อมูลทันที* |

### 4. Work API (ระบบบริหารจัดการงาน) - `/api/work`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ดึงข้อมูลงานทั้งหมด | - |
| `GET` | `/creat` | เรียกใช้งาน Controller สร้างงาน (คำนวณและจับคู่เส้นทาง) | - |
| `GET` | `/:id` | ดึงข้อมูลงานผ่าน ID | - |
| `PUT` | `/accept/:id` | ไรเดอร์ยอมรับงาน (Accept Work) | - |
| `PUT` | `/logout/:id` | ไรเดอร์ออกจากงาน (Logout Work) | - |
| `DELETE` | `/clear` | ล้างข้อมูลงานทั้งหมดออกจากระบบ | *หมายเหตุ: Route นี้ต้องเรียกใช้งานก่อน /:id* |
| `DELETE` | `/:id` | ลบงานผ่าน ID | - |

### 5. Route API (ระบบจัดการเส้นทางขนส่ง) - `/api/route`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ดึงข้อมูลเส้นทางทั้งหมด | - |
| `GET` | `/:id` | ดึงข้อมูลเส้นทางผ่าน ID | - |
| `GET` | `/work/:id` | ดึงข้อมูลเส้นทางผ่าน Work ID (ใช้ลากเส้นบนแผนที่แยกตามสีไรเดอร์) | - |

### 6. Setting API (ระบบตั้งค่าร้านค้า) - `/api/setting`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | ดึงข้อมูลการตั้งค่าปัจจุบันของร้าน | - |
| `PUT` | `/` | อัปเดตข้อมูลการตั้งค่าร้านค้า (ปรับค่าใช้จ่ายและข้อจำกัด) | `{ shop_name, shop_address, shop_latitude, shop_longitude, box_price, box_cost, rider_base_fee, rider_speed_kmh, max_orders_rider, max_boxes_order, departure_time, deadline_time, service_radius_km, id }` |

### 7. Test API (ระบบทดสอบระบบ) - `/api/test`

| Method | Endpoint | Description | Query Parameters / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | เรียกใช้งานหน้าทดสอบ (Get Test) | - |
| `GET` | `/con` | ตรวจสอบการเชื่อมต่อระบบฐานข้อมูล (Get Connection) | - |

## ทีมงานและหน้าที่รับผิดชอบ (Team & Responsibilities)

| ลำดับ | รายชื่อสมาชิก | รหัสนิสิต | หน้าที่และความรับผิดชอบ |
| :---: | :--- | :---: | :--- |
| 1 | **นายธาดา ทองอ่อน** | 67011212035 | ผู้ดูแลหลักวางโครงสร้างโปรเจกต์, บริหารจัดการฐานข้อมูล (DB Management) และพัฒนา API เส้น `/api/route`, `/api/setting`, `/api/test` รวมถึงระบบคำนวณจับคู่เส้นทาง `/api/work/creat` |
| 2 | **นางสาวกัญญานัฐ ท้าวจัตุรัส** | 67011212078 | พัฒนาและดูแลระบบบริหารจัดการงานสำหรับไรเดอร์ API เส้น `/api/work` |
| 3 | **นางสาวจุฑารัตน์ พินธุกรณ์** | 67011212012 | พัฒนาและดูแลระบบจัดการข้อมูลและพิกัดแผนที่ลูกค้า API เส้น `/api/customer` |
| 4 | **นายปภังกร วิเศษศรี** | 67011212045 | พัฒนาและดูแลระบบจัดการข้อมูลชุดคำสั่งซื้อและจำลองข้อมูล API เส้น `/api/order` |
