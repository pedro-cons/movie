import LoginForm from '@/features/auth/components/LoginForm';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Sign In</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Sign in to manage movies, actors, and ratings
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-xs text-gray-400 text-center mt-4">
            Default credentials: admin / password123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
