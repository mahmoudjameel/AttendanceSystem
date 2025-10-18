import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, TrendingUp, Calendar, BarChart3, 
  FileText, Download, Bell, Building, LogOut
} from 'lucide-react';
import VacationManager from './VacationManager';
import NotificationSystem from './NotificationSystem';
import AdvancedStats from './AdvancedStats';
import EmployeeStudentManagement from './EmployeeStudentManagement';
import VacationReview from './VacationReview';
import { exportDailyReport, exportMonthlyReport, exportDepartmentReport } from '../utils/exportUtils';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

const ManagerDashboard = ({ 
  user, 
  employees, 
  attendance, 
  departments, 
  onLogout,
  checkIn,
  checkOut,
  markAbsent,
  getTodayAttendance,
  getEmployeeStats,
  loadEmployees,
  loadAttendance,
  showAddEmployee,
  setShowAddEmployee,
  newEmployee,
  setNewEmployee,
  error,
  setError,
  loading,
  setLoading
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingBadge, setPendingBadge] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      const snapshot = await getDocs(collection(db, 'vacationRequests'));
      setPendingBadge(snapshot.docs.filter(doc => doc.data().status === 'معلق' && doc.data().department === user.department).length);
    };
    fetchPending();
  }, [user.department]);

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = getTodayAttendance();
  const presentCount = todayAttendance.filter(a => a.status === 'حاضر').length;
  const absentCount = todayAttendance.filter(a => a.status === 'غائب').length;

  // فلترة الموظفين حسب القسم
  const departmentEmployees = employees.filter(emp => emp.department === user.department);
  const departmentAttendance = todayAttendance.filter(a => 
    departmentEmployees.some(emp => emp.id === a.employeeId)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* شريط التنقل العلوي */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">لوحة تحكم مدير الأقسام</h1>
                <p className="text-sm text-gray-500">مرحباً، {user.name} - {user.department}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationSystem 
                employees={departmentEmployees} 
                attendance={attendance} 
                today={today} 
              />
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
        {/* إحصائيات القسم */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">موظفو القسم</p>
                <p className="text-3xl font-bold text-blue-600">{departmentEmployees.length}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الحاضرين اليوم</p>
                <p className="text-3xl font-bold text-green-600">{departmentAttendance.filter(a => a.status === 'حاضر').length}</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الغائبين اليوم</p>
                <p className="text-3xl font-bold text-red-600">{departmentAttendance.filter(a => a.status === 'غائب').length}</p>
              </div>
              <Clock className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">نسبة الحضور</p>
                <p className="text-3xl font-bold text-purple-600">
                  {departmentEmployees.length > 0 ? 
                    Math.round((departmentAttendance.filter(a => a.status === 'حاضر').length / departmentEmployees.length) * 100) : 0}%
                </p>
              </div>
              <BarChart3 className="text-purple-500" size={32} />
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 size={20} />
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Clock size={20} />
              الحضور اليوم
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users size={20} />
              موظفو القسم
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users size={20} />
              إدارة الموظفين والطلاب
            </button>
            <button
              onClick={() => setActiveTab('vacation')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'vacation'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={20} />
              الإجازات
              {pendingBadge > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{pendingBadge}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <BarChart3 size={20} />
              إحصائيات القسم
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText size={20} />
              تقارير القسم
            </button>
          </div>
        </div>

        {/* محتوى التبويبات */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* نظرة عامة */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">نظرة عامة على قسم {user.department}</h2>
              
              {/* إحصائيات القسم */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">إجمالي الموظفين</h3>
                  <p className="text-3xl font-bold text-blue-600">{departmentEmployees.length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">نسبة الحضور اليوم</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {departmentEmployees.length > 0 ? 
                      Math.round((departmentAttendance.filter(a => a.status === 'حاضر').length / departmentEmployees.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* موظفو القسم */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">موظفو القسم</h3>
                <div className="space-y-3">
                  {departmentEmployees.map(emp => {
                    const empAttendance = todayAttendance.find(a => a.employeeId === emp.id);
                    const status = empAttendance?.status || 'لم يتم تحديثه';
                    return (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{emp.name}</p>
                            <p className="text-sm text-gray-500">{emp.specialty || 'غير محدد'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          status === 'حاضر' ? 'bg-green-100 text-green-700' :
                          status === 'غائب' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* الحضور اليوم */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">حالة الحضور اليوم - قسم {user.department}</h2>

              {departmentEmployees.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500 text-lg">لا توجد موظفين في هذا القسم</p>
                </div>
              ) : (
                departmentEmployees.map(emp => {
                  const empAttendance = todayAttendance.find(a => a.employeeId === emp.id);
                  const status = empAttendance?.status || 'لم يتم تحديثه';
                  const checkInTime = empAttendance?.checkIn || '-';
                  const checkOutTime = empAttendance?.checkOut || '-';

                  return (
                    <div key={emp.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{emp.name}</h3>
                          <p className="text-sm text-gray-500">{emp.specialty || 'غير محدد'}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>الدخول: <span className="font-semibold text-blue-600">{checkInTime}</span></span>
                            <span>الخروج: <span className="font-semibold text-blue-600">{checkOutTime}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            status === 'حاضر' ? 'bg-green-100 text-green-700' :
                            status === 'غائب' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {status}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => checkIn(emp.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-semibold"
                            >
                              دخول
                            </button>
                            <button
                              onClick={() => checkOut(emp.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold"
                            >
                              خروج
                            </button>
                            <button
                              onClick={() => markAbsent(emp.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold"
                            >
                              غائب
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* موظفو القسم */}
          {activeTab === 'employees' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">موظفو قسم {user.department}</h2>

              {departmentEmployees.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500 text-lg">لا توجد موظفين في هذا القسم</p>
                </div>
              ) : (
                departmentEmployees.map(emp => {
                  const stats = getEmployeeStats(emp.id);
                  return (
                    <div key={emp.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{emp.name}</h3>
                          <p className="text-sm text-gray-500">{emp.email}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>التخصص: <span className="font-semibold">{emp.specialty || 'غير محدد'}</span></span>
                            <span>تاريخ الالتحاق: <span className="font-semibold">{emp.joinDate}</span></span>
                          </div>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-green-600">حاضر: {stats.present}</span>
                            <span className="text-red-600">غائب: {stats.absent}</span>
                            <span className="text-gray-600">إجمالي: {stats.total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* إدارة الموظفين والطلاب */}
          {activeTab === 'manage' && (
            <EmployeeStudentManagement 
              currentUser={user} 
              onEmployeeChange={() => {
                loadEmployees();
                loadAttendance();
              }}
            />
          )}

          {/* الإجازات */}
          {activeTab === 'vacation' && (
            <VacationReview currentUser={user}/>
          )}

          {/* إحصائيات القسم */}
          {activeTab === 'stats' && (
            <AdvancedStats employees={departmentEmployees} attendance={attendance} selectedPeriod="month" />
          )}

          {/* تقارير القسم */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">تقارير قسم {user.department}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => exportDailyReport(attendance, departmentEmployees, today)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex flex-col items-center gap-2"
                >
                  <Download size={24} />
                  <span className="font-semibold">تقرير يومي</span>
                  <span className="text-sm opacity-90">تصدير Excel</span>
                </button>
                
                <button
                  onClick={() => {
                    const currentDate = new Date();
                    exportMonthlyReport(attendance, departmentEmployees, currentDate.getFullYear(), currentDate.getMonth() + 1);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex flex-col items-center gap-2"
                >
                  <Download size={24} />
                  <span className="font-semibold">تقرير شهري</span>
                  <span className="text-sm opacity-90">تصدير Excel</span>
                </button>
                
                <button
                  onClick={() => exportDepartmentReport(attendance, departmentEmployees, user.department)}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex flex-col items-center gap-2"
                >
                  <Download size={24} />
                  <span className="font-semibold">تقرير قسمي</span>
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

export default ManagerDashboard;
