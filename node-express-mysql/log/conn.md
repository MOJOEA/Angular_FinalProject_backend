cd logitrack-docker                 
docker compose down -v

สร้างไฟล์ .env แล้วใส่

DB_HOST=localhost
DB_PORT=3306
DB_USER=logitrack_user
DB_PASSWORD=logitrack_password
DB_DATABASE=logitrack_db
DB_MAX_CONNECTIONS=10

admin pang: http://localhost:5050/

• Username: root
• Password: root_logitrack_password
