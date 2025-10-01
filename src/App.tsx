import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import TryOnPage from './pages/TryOnPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import AdminLayout from './components/AdminLayout';
import AdminOrderPage from './pages/AdminOrderPage';
import AdminUserPage from './pages/AdminUserPage';
import AdminNewsPage from './pages/AdminNewsPage';
import AdminProductPage from './pages/AdminProductPage';
import AdminBrandPage from './pages/AdminBrandPage';
import AdminCategoryPage from './pages/AdminCategoryPage';
import AdminRecommendationPage from './pages/AdminRecommendationPage';
import AdminDiscountPage from './pages/AdminDiscountPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ChatbotPage from './pages/ChatbotPage';
import ProfilePage from './pages/ProfilePage';
import AdminImageGalleryPage from './pages/AdminImageGalleryPage';

import OrderResultPage from './pages/OrderResultPage';

// A more defined theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductDetailPage />} />
          <Route path="try-on" element={<TryOnPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="order-result" element={<OrderResultPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />

          <Route path="news" element={<NewsPage />} />
          <Route path="news/:newsId" element={<NewsDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="orders" element={<AdminOrderPage />} />
          <Route path="users" element={<AdminUserPage />} />
          <Route path="news" element={<AdminNewsPage />} />
          <Route path="products" element={<AdminProductPage />} />
          <Route path="brands" element={<AdminBrandPage />} />
          <Route path="categories" element={<AdminCategoryPage />} />
          <Route path="recommendations" element={<AdminRecommendationPage />} />
          <Route path="discounts" element={<AdminDiscountPage />} />
          <Route path="images" element={<AdminImageGalleryPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;