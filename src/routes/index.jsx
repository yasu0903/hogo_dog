// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import PrivacyPolicy from '../pages/PrivacyPlicy';
import TermsOfService from '../pages/TermsOfService';

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