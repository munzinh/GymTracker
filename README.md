# 🏋️‍♂️ GymTracker - Công cụ theo dõi tập luyện & dinh dưỡng

GymTracker là ứng dụng web hiện đại giúp bạn theo dõi quá trình tập luyện, tính toán dinh dưỡng và quản lý mục tiêu hình thể một cách khoa học. Được thiết kế tối ưu cho trải nghiệm di động, tập trung vào sự tối giản và hiệu quả.

🚀 **Xem bản live tại đây:** [https://munzinh.github.io/GymTracker](https://munzinh.github.io/GymTracker)

---

## ✨ Tính năng chính
- 📊 **Dashboard thông minh**: Theo dõi calo, macros và tiến độ tập luyện hàng ngày.
- 🍱 **Quản lý dinh dưỡng (Nutrition Hub)**: Tìm kiếm và thêm món ăn từ cơ sở dữ liệu phong phú hoặc tự thêm món mới.
- 📈 **Báo cáo InBody**: Lưu trữ và phân tích các chỉ số cơ thể (Cân nặng, Tỉ lệ mỡ, Khối lượng cơ).
- ⚙️ **Công cụ tính toán**: Tích hợp các công thức TDEE, Macro targets và Fitness Score.
- 🌑 **Giao diện hiện đại**: Dark mode với hiệu ứng neon green và Glassmorphism cao cấp.

---

## 🆕 Bản cập nhật mới nhất

### 1. Menu điều hướng Floating (Overlay Menu)
- Thay thế sidebar cũ bằng menu dạng lớp phủ (overlay) hiện đại.
- Hiệu ứng đổ bóng mờ (shadow opening), backdrop-blur và micro-animations mượt mà.
- Thiết kế 2 cột giúp thao tác nhanh và tối ưu diện tích màn hình.

### 2. Tích hợp Thêm món nhanh (Quick Food Add)
- Nút "Thêm nhanh" (+) được tích hợp ngay trong Modal tìm kiếm thức ăn.
- Cho phép người dùng tạo ngay món ăn mới khi không tìm thấy trong database.
- Tự động chọn món vừa tạo để thêm vào bữa ăn, giúp tiết kiệm thao tác.
- Cải thiện trạng thái "Không tìm thấy kết quả" với gợi ý tự thêm món.

### 3. Tối ưu hóa hệ thống & UI/UX
- Sửa các lỗi Build TypeScript và lỗi cú pháp trong các component cốt lõi.
- Điều chỉnh khoảng cách và bố cục menu giúp giao diện thoáng đãng và dễ nhìn hơn.
- Hiệu ứng Focus và Hover mượt mà trên toàn bộ các nút bấm và input.

---

## 🛠 Công nghệ sử dụng
- **Core**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Data**: LocalStorage (Không cần database backend, bảo mật dữ liệu cá nhân)
- **Deployment**: GitHub Pages

---

## 🏃‍♂️ Chạy Project locally
1. Clone repo: `git clone https://github.com/munzinh/GymTracker.git`
2. Cài đặt dependencies: `npm install`
3. Chạy dev server: `npm run dev`
4. Build bản production: `npm run build`

---
Copyright © 2026 **By Munzinh**
