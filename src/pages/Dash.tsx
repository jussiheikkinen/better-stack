import '@/App.css';
import AuthButton from '@/components/AuthButton';

const Dash = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rsbuild with React
          </h1>
          <p className="text-gray-600">
            Start building amazing things with Rsbuild.
          </p>
        </div>

        <div className="space-y-4">
          <AuthButton variant="login" className="w-full">
            Login with GitHub
          </AuthButton>
          <AuthButton variant="logout" className="w-full">
            Logout
          </AuthButton>
        </div>
      </div>
    </div>
  );
};

export default Dash;
