-- 1. Thêm cột "type" vào bảng Room (Đơn / Đôi / Gia đình)
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'Đơn';

-- 2. Tạo bảng Shift để lưu lịch phân ca nhân viên
CREATE TABLE IF NOT EXISTS "Shift" (
  id serial PRIMARY KEY,
  "employeeId" integer NOT NULL REFERENCES "Employee"(id) ON DELETE CASCADE,
  date date NOT NULL,
  shift text NOT NULL CHECK (shift IN ('SANG', 'CHIEU', 'DEM')),
  CONSTRAINT "Shift_employee_date_shift_unique" UNIQUE ("employeeId", date, shift)
);

CREATE INDEX IF NOT EXISTS "idx_shift_date" ON "Shift"(date);
CREATE INDEX IF NOT EXISTS "idx_shift_employee" ON "Shift"("employeeId");

-- 3. Tạo bảng Service để quản lý danh mục dịch vụ phòng
CREATE TABLE IF NOT EXISTS "Service" (
  id text PRIMARY KEY,
  name text NOT NULL,
  "unitPrice" numeric NOT NULL,
  active boolean NOT NULL DEFAULT true
);

