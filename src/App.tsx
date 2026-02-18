import './App.css';
import { StaticRouter } from 'react-router';
import Routes from '@/routes';

interface RootProps {
  req: {
    url: string;
    [key: string]: unknown;
  };
}

const App = ({ req }: RootProps) => {
  return (
    <StaticRouter location={req.url}>
      <Routes />
    </StaticRouter>
  );
};

export default App;
