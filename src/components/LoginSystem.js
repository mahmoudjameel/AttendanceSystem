import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, GraduationCap, Building, Shield, Users } from 'lucide-react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const LoginSystem = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // بيانات المستخدمين التجريبية
  const users = {
    admin: {
      email: 'admin@admin',
      password: '123456',
      name: 'المدير العام',
      role: 'admin',
      department: 'إدارة',
      specialty: 'إدارة عامة'
    },
    manager: {
      email: 'manager@company.com',
      password: 'manager123',
      name: 'مدير الأقسام',
      role: 'manager',
      department: 'إدارة',
      specialty: 'إدارة أقسام'
    },
    employee: {
      email: 'employee@company.com',
      password: 'employee123',
      name: 'أحمد محمد',
      role: 'employee',
      department: 'تطوير',
      specialty: 'Backend'
    },
    student: {
      email: 'student@university.edu',
      password: 'student123',
      name: 'فاطمة علي',
      role: 'student',
      department: 'طالب',
      specialty: 'طالب جامعي'
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // محاكاة تأخير للواقعية (يمكن إزالة السطر إذا أردت)
      await new Promise(resolve => setTimeout(resolve, 700));

      // تحقق من Firestore لكل دور ما عدا الأدمن
      if (loginData.role === 'manager' || loginData.role === 'employee' || loginData.role === 'student') {
        let col = '';
        if (loginData.role === 'manager') col = 'managers';
        if (loginData.role === 'employee') col = 'employees';
        if (loginData.role === 'student') col = 'students';
        const q = query(
          collection(db, col),
          where('email', '==', loginData.email),
          where('password', '==', loginData.password)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const dbUser = userDoc.data();
          onLogin({ ...dbUser, id: userDoc.id, role: loginData.role });
          setLoading(false);
          return;
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          setLoading(false);
          return;
        }
      }

      // الأدمن فقط من البيانات التجريبية
      const user = Object.values(users).find(u =>
        u.email === loginData.email && u.password === loginData.password && u.role === loginData.role
      );
      if (user) {
        onLogin(user);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return Building;
      case 'employee': return Users;
      case 'student': return GraduationCap;
      default: return User;
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'مدير عام';
      case 'manager': return 'مدير أقسام';
      case 'employee': return 'موظف';
      case 'student': return 'طالب';
      default: return 'مستخدم';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-red-600';
      case 'manager': return 'from-blue-500 to-blue-600';
      case 'employee': return 'from-green-500 to-green-600';
      case 'student': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-200 via-blue-100 to-white p-4" dir="rtl">
      <div className="w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-indigo-100 bg-white overflow-hidden">
        {/* الشعار والعنوان */}
        <div className="flex flex-col items-center py-8 px-6 bg-gradient-to-t from-indigo-50 to-indigo-100 border-b mb-4">
          <div className="bg-indigo-600 w-20 h-20 rounded-full flex items-center justify-center shadow-md mb-3">
            <User className="text-white" size={44} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-1">نظام الحضور والغياب</h1>
          <p className="text-gray-500 mt-0.5 mb-2 text-base">تسجيل الدخول إلى النظام</p>
        </div>

        {/* استمارة تسجيل الدخول */}
        <form onSubmit={handleLogin} className="py-8 px-6 md:px-8 space-y-7">
          {/* اختيار نوع المستخدم */}
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-3">نوع المستخدم</label>
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {Object.entries(users).map(([key, user]) => {
                const IconComponent = getRoleIcon(user.role);
                const isSelected = loginData.role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLoginData({ ...loginData, role: key, email: '' })}
                    className={
                      `flex flex-col items-center py-3 rounded-2xl border-2 w-full transition-all duration-150 font-semibold text-gray-600 `+
                      (isSelected ? 'border-indigo-500 ring-4 ring-indigo-100 bg-indigo-50 text-indigo-900 scale-105' : 'border-gray-200 bg-white hover:bg-gray-50')
                    }
                  >
                    <IconComponent size={28} className="mb-1 mt-0.5" />
                    <span>{getRoleText(user.role)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg shadow-inner"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
          {/* كلمة المرور */}
          <div>
            <label className="block text-md font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg shadow-inner"
                placeholder="أدخل كلمة المرور"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <Lock className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            </div>
          </div>
          {/* رسالة الخطأ */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-semibold text-base">
              {error}
            </div>
          )}
          {/* زر الدخول */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-extrabold tracking-wide text-lg shadow-lg transition-all duration-200 text-white ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-l from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-indigo-100/60'
            }`}
          >
            {loading
              ? (<div className="flex items-center justify-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>جاري تسجيل الدخول...</div>)
              : 'دخول للنظام'}
          </button>
        </form>
        {/* هامش سفلي */}
        <div className="py-4"></div>
      </div>
    </div>
  );
};

export default LoginSystem;
