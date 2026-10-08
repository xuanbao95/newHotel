# Quản lý Nhà nghỉ Mẫu

Ứng dụng quản lý nhà nghỉ 12 phòng (101–304, 3 tầng) viết bằng **Next.js 14 (App Router)**, **TypeScript** và **Tailwind CSS**.

## Tính năng

- **Tổng quan** (`/`): số phòng theo trạng thái, công suất, lượt nhận/trả phòng hôm nay.
- **Sơ đồ phòng** (`/phong`): sơ đồ theo tầng có màu trạng thái, lọc theo trạng thái / tầng / loại phòng. Bấm phòng để check-in (khách đặt trước hoặc khách vãng lai), check-out kèm hoá đơn, đánh dấu dọn xong, bật/tắt bảo trì.
- **Đặt phòng** (`/dat-phong`): form đặt phòng mới chỉ hiện phòng trống và tự tính tổng tiền; bảng đặt phòng có tìm kiếm và huỷ.
- **Khách đang ở** (`/khach`): tạm tính, thêm dịch vụ (nước, giặt ủi, thuê xe máy, ăn sáng), check-out.
- **Nhân viên** (`/nhan-vien`): thêm, sửa, xoá nhân viên và xếp lịch ca tuần (Sáng 6h–14h, Chiều 14h–22h, Đêm 22h–6h).

Dữ liệu được dùng chung giữa các trang qua React Context và **lưu vào `localStorage`** của trình duyệt, nên tải lại trang vẫn giữ nguyên. Nút **"Khôi phục dữ liệu mẫu"** ở chân trang đưa dữ liệu về ban đầu (ngày đặt phòng mẫu tính theo ngày hôm nay).

## Yêu cầu

- Node.js 18.17 trở lên (khuyến nghị Node 20+)
- npm

## Chạy dự án

```bash
npm install
npm run dev
```

Mở trình duyệt tại <http://localhost:3000>.

Các lệnh khác:

```bash
npm run build   # build bản production
npm run start   # chạy bản đã build
npm run lint    # kiểm tra ESLint
```

## Cấu trúc thư mục

```
app/
  layout.tsx          # layout gốc (lang="vi"), header, footer, provider
  page.tsx            # Tổng quan
  phong/page.tsx      # Sơ đồ phòng
  dat-phong/page.tsx  # Đặt phòng
  khach/page.tsx      # Khách đang ở
  nhan-vien/page.tsx  # Nhân viên
  globals.css         # Tailwind
components/           # Header, RoomCard, RoomModal, BookingForm, StatCard, Modal, ...
  views/              # nội dung từng trang (client component)
context/
  HotelProvider.tsx   # state dùng chung + lưu localStorage
lib/
  types.ts            # kiểu dữ liệu: Room, Booking, Guest, Staff, Shift, ...
  data.ts             # dữ liệu mẫu, giá phòng, giá dịch vụ, ca làm
  hotel.ts            # logic: trạng thái phòng, tạm tính, hoá đơn
  status.ts           # màu theo trạng thái
  utils.ts            # định dạng tiền VND (350.000 ₫), ngày tháng
```

## Giá

| Loại phòng | Giá / đêm |
|---|---|
| Đơn (101, 102, 201, 202) | 300.000 ₫ |
| Đôi (103, 104, 203, 204, 301, 302) | 450.000 ₫ |
| Gia đình (303, 304) | 650.000 ₫ |

Dịch vụ: Nước 15.000 ₫ · Giặt ủi 30.000 ₫ · Thuê xe máy 120.000 ₫ · Ăn sáng 40.000 ₫.

## Ghi chú

- Đây là ứng dụng chạy hoàn toàn phía trình duyệt, chưa có backend hay đăng nhập. Dữ liệu chỉ nằm trên máy đang dùng.
- Mở nhiều tab cùng lúc: các tab tự đồng bộ khi dữ liệu thay đổi.
