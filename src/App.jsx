// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import UserSwitcher from './components/dev/UserSwitcher';
import router from './routes';

function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <RouterProvider router={router} />
        <UserSwitcher />
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
