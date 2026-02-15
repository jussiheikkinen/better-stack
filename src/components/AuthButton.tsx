import { useAuth } from '../hooks/useAuth';

interface AuthButtonProps {
  variant: 'login' | 'logout';
  className?: string;
  children?: React.ReactNode;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  variant,
  className = '',
  children,
}) => {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth();

  // Don't render login button if user is already authenticated
  // Don't render logout button if user is not authenticated
  const shouldRender =
    (variant === 'login' && !isAuthenticated) ||
    (variant === 'logout' && isAuthenticated);

  if (!shouldRender) {
    return null;
  }

  const handleClick = async () => {
    if (variant === 'login') {
      await login();
    } else {
      await logout();
    }
  };

  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses =
    variant === 'login'
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  const disabledClasses = isLoading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      >
        {isLoading
          ? 'Loading...'
          : children || (variant === 'login' ? 'Login' : 'Logout')}
      </button>
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default AuthButton;
