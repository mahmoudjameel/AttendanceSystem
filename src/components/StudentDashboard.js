import React, { useState } from 'react';
import { 
  Clock, Calendar, BarChart3, FileText, LogOut, 
  CheckCircle, XCircle, AlertCircle, GraduationCap, BookOpen
} from 'lucide-react';
import { exportDailyReport } from '../utils/exportUtils';
import VacationRequest from './VacationRequest';

const StudentDashboard = ({ 
  user, 
  attendance, 
  onLogout,
  checkIn,
  checkOut,
  markAbsent,
  getTodayAttendance,
  getEmployeeStats
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100" dir="rtl">
      {/* شريط التنقل العلوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة تحكم الطالب</h1>
                <p className="text-sm text-gray-500">مرحباً، {user.name} - {user.specialty}</p>
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
              <p className="text-2xl font-bold text-purple-600">{userAttendance?.checkIn || '-'}</p>
            </div>

            {/* وقت الخروج */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">وقت الخروج</p>
              <p className="text-2xl font-bold text-purple-600">{userAttendance?.checkOut || '-'}</p>
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
                تسجيل الحضور
              </button>
            )}
            
            {userAttendance?.checkIn && !userAttendance?.checkOut && (
              <button
                onClick={handleCheckOut}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
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
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                      <span className="font-semibold text-purple-600">{userAttendance?.checkIn || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">وقت الخروج:</span>
                      <span className="font-semibold text-purple-600">{userAttendance?.checkOut || '-'}</span>
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
                      <span className="text-gray-600">التخصص:</span>
                      <span className="font-semibold">{user.specialty || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">نوع الطالب:</span>
                      <span className="font-semibold">{user.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية للطالب */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} />
                  معلومات أكاديمية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">نسبة الحضور الإجمالية</h4>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-purple-500 h-4 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ 
                          width: `${userStats.total > 0 ? (userStats.present / userStats.total) * 100 : 0}%` 
                        }}
                      >
                        {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">إجمالي أيام الحضور</h4>
                    <p className="text-2xl font-bold text-purple-600">{userStats.present} يوم</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">إحصائياتي الأكاديمية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">أيام الحضور</h3>
                  <p className="text-3xl font-bold text-green-600">{userStats.present}</p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">أيام الغياب</h3>
                  <p className="text-3xl font-bold text-red-600">{userStats.absent}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">نسبة الحضور</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* تقييم الأداء */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">تقييم الأداء الأكاديمي</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">نسبة الحضور المطلوبة:</span>
                    <span className="font-semibold text-gray-800">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">نسبة الحضور الفعلية:</span>
                    <span className={`font-semibold ${
                      userStats.total > 0 && (userStats.present / userStats.total) * 100 >= 75 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        userStats.total > 0 && (userStats.present / userStats.total) * 100 >= 75 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${userStats.total > 0 ? (userStats.present / userStats.total) * 100 : 0}%` 
                      }}
                    >
                      {userStats.total > 0 ? Math.round((userStats.present / userStats.total) * 100) : 0}%
                    </div>
                  </div>
                  <div className="text-center">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      userStats.total > 0 && (userStats.present / userStats.total) * 100 >= 75 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userStats.total > 0 && (userStats.present / userStats.total) * 100 >= 75 
                        ? 'ممتاز - نسبة الحضور جيدة' 
                        : 'يحتاج تحسين - نسبة الحضور منخفضة'}
                    </span>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">تقاريري الأكاديمية</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => exportDailyReport(attendance, [user], today)}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg flex flex-col items-center gap-3"
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
                  className="bg-pink-500 hover:bg-pink-600 text-white p-6 rounded-lg flex flex-col items-center gap-3"
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

export default StudentDashboard;
