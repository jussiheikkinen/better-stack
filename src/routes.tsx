import { Outlet, useRoutes } from 'react-router';
import Dash from './pages/Dash';

const Routes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      Component: () => <Outlet />,
      children: [
        {
          path: '/',
          Component: () => <Dash />,
        },
      ],
    },
    {
      path: '/welcome',
      Component: () => <div>Welcome to Better Auth!</div>,
    },
    {
      path: '/error',
      Component: () => <div>An error occurred.</div>,
    },
    {
      path: '*',
      Component: () => <div>404</div>,
    },
  ]);

  return routes;
};

export default Routes;
