// src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Organizations from '../pages/Organizations';
import OrganizationDetail from '../pages/OrganizationDetail';
import Organization from '../pages/Organization';
import Spots from '../pages/Spots';
import PrivacyPolicy from '../pages/PrivacyPolicy';
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
    path: '/spots',
    element: <Spots />,
  },
  {
    path: '/organizations/:id',
    element: <OrganizationDetail />,
  },
  {
    path: '/organizations/:prefectureId/:orgId',
    element: <Organization />,
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
