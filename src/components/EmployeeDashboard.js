import React, { useState } from 'react';
import { 
  Clock, Calendar, BarChart3, FileText, LogOut, 
  CheckCircle, XCircle, AlertCircle, User
} from 'lucide-react';
import { exportDailyReport } from '../utils/exportUtils';
import VacationRequest from './VacationRequest';

const EmployeeDashboard = ({ 
  user, 
  attendance, 
  onLogout,
  checkIn,
  checkOut,
  markAbsent,
  getTodayAttendance,
  getEmployeeStats,
  showAddEmployee,
  setShowAddEmployee,
  newEmployee,
  setNewEmployee,
  error,
  setError,
  loading,
  setLoading
}) => {
  const [activeTab, setActiveTab] = useState('attendance');

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getTodayAttendance();
  const userAttendance = todayAttendance.find(a => a.employeeId === user.id);
  const userStats = getEmployeeStats(user.id);

  const handleCheckIn = () => {
    checkIn(user.id);
  };

  const handleCheckOut = () => {
    checkOut(user.id);
  };

  const handleMarkAbsent = () => {
    markAbsent(user.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'حاضر': return 'text-green-600 bg-green-100';
      case 'غائب': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'حاضر': return CheckCircle;
      case 'غائب': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100" dir="rtl">
      {/* شريط التنقل العلوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة تحكم الموظف</h1>
                <p className="text-sm text-gray-500">مرحباً، {user.name} - {user.department}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={20} />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* حالة الحضور اليوم */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">حالة الحضور اليوم</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* حالة الحضور */}
            <div className="text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getStatusColor(userAttendance?.status || 'لم يتم تحديثه')}`}>
                {React.createElement(getStatusIcon(userAttendance?.status || 'لم يتم تحديثه'), { size: 20 })}
                {userAttendance?.status || 'لم يتم تحديثه'}
              </div>
            </div>

            {/* وقت الدخول */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">وقت الدخول</p>
              <p className="text-2xl font-bold text-blue-600">{userAttendance?.checkIn || '-'}</p>
            </div>

            {/* وقت الخروج */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">وقت الخروج</p>
              <p className="text-2xl font-bold text-blue-600">{userAttendance?.checkOut || '-'}</p>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-center gap-4 mt-6">
            {!userAttendance?.checkIn && (
              <button
                onClick={handleCheckIn}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <CheckCircle size={20} />
                تسجيل الدخول
              </button>
            )}
            
            {userAttendance?.checkIn && !userAttendance?.checkOut && (
              <button
                onClick={handleCheckOut}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <XCircle size={20} />
                تسجيل الخروج
              </button>
            )}
            
            {!userAttendance && (
              <button
                onClick={handleMarkAbsent}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <AlertCircle size={20} />
                تسجيل غياب
              </button>
            )}
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Clock size={20} />
              الحضور اليوم
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={20} />
              سجل الحضور
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 size={20} />
              إحصائياتي
            </button>
            <button
              onClick={() => setActiveTab('vacation')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'vacation'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={20} />
              طلب إجازة
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText size={20} />
              تقاريري
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* الحضور اليوم */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">حالة الحضور اليوم</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات الحضور</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">التاريخ:</span>
                      <span className="font-semibold">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(userAttendance?.status || 'لم يتم تحديثه')}`}>
                        {userAttendance?.status || 'لم يتم تحديثه'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">وقت الدخول:</span>
                      <span className="font-semibold text-blue-600">{userAttendance?.checkIn || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">وقت الخروج:</span>
                      <span className="font-semibold text-blue-600">{userAttendance?.checkOut || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">معلوماتي الشخصية</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاسم:</span>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">البريد الإلكتروني:</span>
                      <span className="font-semibold">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">القسم:</span>
                      <span className="font-semibold">{user.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">التخصص:</span>
                      <span className="font-semibold">{user.specialty || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* سجل الحضور */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">سجل الحضور</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">التاريخ</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">وقت الدخول</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">وقت الخروج</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-800">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance
                      .filter(record => record.employeeId === user.id)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 30)
                      .map((record, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-800">{record.date}</td>
                          <td className="py-3 px-4 text-gray-600">{record.checkIn || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">{record.checkOut || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* إحصائياتي */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إحصائياتي الشخصية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">أيام الحضور</h3>
                  <p className="text-3xl font-bold text-green-600">{userStats.present}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">أيام الغياب</h3>
                  <p className="text-3xl font-bold text-red-600">{userStats.absent}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">نسبة الحضور</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* رسم بياني بسيط */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">مخطط نسبة الحضور</h3>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-green-500 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ 
                      width: `${userStats.total > 0 ? (userStats.present / userStats.total) * 100 : 0}%` 
                    }}
                  >
                    {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* طلب إجازة */}
          {activeTab === 'vacation' && (
            <VacationRequest 
              currentUser={user} 
              onRequestChange={() => {
                // يمكن إضافة تحديث البيانات هنا إذا لزم الأمر
              }}
            />
          )}

          {/* تقاريري */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">تقاريري الشخصية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => exportDailyReport(attendance, [user], today)}
                  className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg flex flex-col items-center gap-3"
                >
                  <FileText size={32} />
                  <span className="text-lg font-semibold">تقرير يومي</span>
                  <span className="text-sm opacity-90">تصدير Excel</span>
                </button>
                
                <button
                  onClick={() => {
                    const userAttendance = attendance.filter(record => record.employeeId === user.id);
                    exportDailyReport(userAttendance, [user], today);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg flex flex-col items-center gap-3"
                >
                  <FileText size={32} />
                  <span className="text-lg font-semibold">تقرير شامل</span>
                  <span className="text-sm opacity-90">تصدير Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
