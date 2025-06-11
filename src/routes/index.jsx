// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import Animals from '../pages/Animals';
import AnimalDetail from '../pages/AnimalDetail';
import Shelters from '../pages/Shelters';
import ShelterDetail from '../pages/ShelterDetail';
// import Adopt from '../pages/Adopt';  // 初期リリースから除外
import Login from '../pages/Login';
// import Dashboard from '../pages/Dashboard';  // 初期リリースから除外
import PrivacyPolicy from '../pages/PrivacyPlicy';
import TermsOfService from '../pages/TermsOfService';
import MyPage from '../pages/MyPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute';
import SuperuserProtectedRoute from '../components/auth/SuperuserProtectedRoute';
import MemberManagement from '../pages/admin/MemberManagement';
import AdminDashboard from '../pages/admin/AdminDashboard';
import SystemDashboard from '../pages/admin/SystemDashboard';
import SystemOrganizations from '../pages/admin/SystemOrganizations';
import SystemUsers from '../pages/admin/SystemUsers';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  // 静的組織データ（情報提供団体）
  {
    path: '/organizations',
    element: <Organizations />,
  },
  {
    path: '/organizations/:id',
    element: <OrganizationDetail />,
  },
  // 動的データ（運営団体・動物管理）
  {
    path: '/animals',
    element: <Animals />,
  },
  {
    path: '/animals/:id',
    element: <AnimalDetail />,
  },
  {
    path: '/shelters',
    element: <Shelters />,
  },
  {
    path: '/shelters/:id',
    element: <ShelterDetail />,
  },
  // 初期リリースから除外 - 申請機能
  // {
  //   path: '/adopt',
  //   element: <Adopt />,
  // },
  // {
  //   path: '/adopt/:animalId',
  //   element: <Adopt />,
  // },
  // 認証関連ページ
  {
    path: '/login',
    element: <Login />,
  },
  // ユーザーマイページ
  {
    path: '/mypage',
    element: <ProtectedRoute element={<MyPage />} />,
  },
  // 初期リリースから除外 - ダッシュボード（申請管理）
  // {
  //   path: '/dashboard',
  //   element: <ProtectedRoute element={<Dashboard />} />,
  // },
  // 管理者専用ページ
  {
    path: '/admin',
    element: <AdminProtectedRoute 
      element={<AdminDashboard />} 
      organizationRole="admin" 
    />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminProtectedRoute 
      element={<AdminDashboard />} 
      organizationRole="admin" 
    />,
  },
  {
    path: '/admin/members',
    element: <AdminProtectedRoute 
      element={<MemberManagement />} 
      organizationRole="admin" 
    />,
  },
  {
    path: '/admin/members/:organizationId',
    element: <AdminProtectedRoute 
      element={<MemberManagement />} 
      organizationRole="admin" 
    />,
  },
  // 静的ページ
  // スーパーユーザー専用ページ
  {
    path: '/system-admin',
    element: <SuperuserProtectedRoute 
      element={<SystemDashboard />} 
      requireSuperuser={true} 
    />,
  },
  {
    path: '/system-admin/dashboard',
    element: <SuperuserProtectedRoute 
      element={<SystemDashboard />} 
      requireSuperuser={true} 
    />,
  },
  {
    path: '/system-admin/organizations',
    element: <SuperuserProtectedRoute 
      element={<SystemOrganizations />} 
      requireSuperuser={true} 
    />,
  },
  {
    path: '/system-admin/organizations/:organizationId',
    element: <SuperuserProtectedRoute 
      element={<SystemOrganizations />} 
      requireSuperuser={true} 
    />,
  },
  {
    path: '/system-admin/users',
    element: <SuperuserProtectedRoute 
      element={<SystemUsers />} 
      requireSuperuser={true} 
    />,
  },
  {
    path: '/system-admin/users/:userId',
    element: <SuperuserProtectedRoute 
      element={<SystemUsers />} 
      requireSuperuser={true} 
    />,
  },
  // 静的ページ
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/terms-of-service',
    element: <TermsOfService />,
  }
]);

export default router;