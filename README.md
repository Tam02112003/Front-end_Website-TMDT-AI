

# Website thương mại điện tử tích hợp AI cho phép người dùng thử đồ ảo, nhận gợi ý sản phẩm thông minh và trò chuyện với chatbot hỗ trợ.<cite></cite>

## 🚀 Công Nghệ Sử Dụng

- **React 18** + **TypeScript** - Framework UI hiện đại
- **Vite** - Build tool nhanh với HMR
- **Material-UI (MUI)** - Component library
- **React Router** - Điều hướng SPA
- **Axios** - HTTP client
- **JWT** - Xác thực người dùng

<cite></cite>

## 📋 Yêu Cầu Hệ Thống

- Node.js 16+ 
- npm hoặc yarn
- Backend API đang chạy

<cite></cite>

## 🔧 Cài Đặt

```bash
# Clone repository
git clone https://github.com/Tam02112003/Front-end_Website-TMDT-AI.git
cd Front-end_Website-TMDT-AI

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

<cite></cite>

## ⚙️ Cấu Hình

Tạo file `.env` với các biến môi trường:

```env
VITE_BACKEND_URL=http://localhost:8000
```

<cite></cite>

## 🏃 Chạy Ứng Dụng

```bash
# Development mode
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

<cite></cite>

## 📱 Tính Năng Chính

### Người Dùng
- **Xác thực**: Đăng nhập/đăng ký với email hoặc Google OAuth
- **AI Try-On**: Thử đồ ảo với công nghệ AI
- **Gợi ý thông minh**: Hệ thống recommendation dựa trên AI
- **Chatbot**: Trợ lý ảo hỗ trợ 24/7 
- **Giỏ hàng & Thanh toán**: Quản lý đơn hàng
- **Tin tức**: Cập nhật xu hướng thời trang

### Quản Trị Viên
- **Dashboard**: Quản lý tổng quan hệ thống 
- **Quản lý sản phẩm**: CRUD products, brands, categories
- **Quản lý đơn hàng**: Xử lý orders
- **Quản lý người dùng**: User management
- **Quản lý tin tức**: Tạo/sửa bài viết với AI 
- **Quản lý khuyến mãi**: Discount management
- **Training AI Model**: Huấn luyện mô hình recommendation
- **Redis Cache**: Xóa cache để tối ưu hiệu suất

<cite></cite>

## 🎨 Responsive Design

Thiết kế mobile-first với breakpoints:

- **Mobile**: 320px - 767px (1 cột)
- **Tablet**: 768px - 1023px (2-3 cột)
- **Desktop**: 1024px - 1439px (3-4 cột)
- **Large**: 1440px+ (4-6 cột)

<cite></cite>

## 🔐 Xác Thực & Phân Quyền

- **JWT Token**: Lưu trong localStorage
- **Role-based Access**: User vs Admin
- **Protected Routes**: Tự động redirect nếu chưa đăng nhập
- **Google OAuth**: Đăng nhập nhanh với Google 

<cite></cite>

## 📁 Cấu Trúc Thư Mục

















```
src/
├── components/        # Reusable components
│   ├── AdminLayout.tsx
│   ├── Chatbot.tsx
│   └── ...
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── AdminNewsPage.tsx
│   └── ...
├── services/         # API services
│   ├── api.ts
│   ├── AdminService.ts
│   └── ...
├── context/          # React Context
├── styles/           # CSS files
└── main.tsx         # Entry point
```

<cite></cite>

## 🛠️ ESLint Configuration

Để production app, cập nhật ESLint config: 

```js




export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,




    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },

    },
  },
])
```

<cite></cite>

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

<cite></cite>

## 📄 License

Distributed under the MIT License.

<cite></cite>

## 📧 Liên Hệ

- GitHub: [@Tam02112003](https://github.com/Tam02112003)
- Project Link: [https://github.com/Tam02112003/Front-end_Website-TMDT-AI](https://github.com/Tam02112003/Front-end_Website-TMDT-AI)
- Project Public Website: [https://front-end-website-tmdt-ai.onrender.com/](https://front-end-website-tmdt-ai.onrender.com/)
- Project Backend: [https://github.com/Tam02112003/Website-TMDT-AI](https://github.com/Tam02112003/Website-TMDT-AI)
- Email: ngminhtam021103@gmail.com
<cite></cite>
