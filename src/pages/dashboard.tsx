import { useAuthStore } from '../store/auth-store';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">پنل مدیریت</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">مدیریت کاربران</h4>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">گزارش‌های سیستم</h4>
              </div>
            </div>
          </div>
        );
      case 'supervisor':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">پنل سرپرست</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">مدیریت وظایف</h4>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">بررسی گزارش‌ها</h4>
              </div>
            </div>
          </div>
        );
      case 'employee':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">پنل کارمند</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">وظایف من</h4>
              </div>
              <div className="p-4 bg-white rounded-lg shadow">
                <h4 className="font-medium">ثبت گزارش</h4>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            سامانه مدیریت وظایف
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {getRoleBasedContent()}
      </main>
    </div>
  );
} 