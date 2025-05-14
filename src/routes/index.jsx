// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/organizations',
    element: <Organizations />,
  },
  {
    path: '/organizations/:id',
    element: <OrganizationDetail />,
  },
]);

export default router;