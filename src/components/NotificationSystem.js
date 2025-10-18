import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, UserX, TrendingDown, CheckCircle } from 'lucide-react';

const NotificationSystem = ({ employees, attendance, today }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [employees, attendance, today]);

  const generateNotifications = () => {
    const newNotifications = [];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // تنبيه الموظفين المتأخرين (بعد 9:00 صباحاً)
    if (currentHour >= 9) {
      const lateEmployees = employees.filter(emp => {
        const empAttendance = attendance.find(a => a.employeeId === emp.id && a.date === today);
        return !empAttendance || !empAttendance.checkIn;
      });

      lateEmployees.forEach(emp => {
        newNotifications.push({
          id: `late-${emp.id}`,
          type: 'warning',
          title: 'موظف متأخر',
          message: `${emp.name} لم يسجل دخول بعد الساعة 9:00 صباحاً`,
          time: currentTimeString,
          icon: Clock,
          priority: 'high'
        });
      });
    }

    // تنبيه الموظفين الغائبين (بعد 10:00 صباحاً)
    if (currentHour >= 10) {
      const absentEmployees = employees.filter(emp => {
        const empAttendance = attendance.find(a => a.employeeId === emp.id && a.date === today);
        return !empAttendance || empAttendance.status === 'غائب';
      });

      absentEmployees.forEach(emp => {
        newNotifications.push({
          id: `absent-${emp.id}`,
          type: 'error',
          title: 'موظف غائب',
          message: `${emp.name} غائب اليوم`,
          time: currentTimeString,
          icon: UserX,
          priority: 'high'
        });
      });
    }

    // تنبيه نسبة الحضور المنخفضة
    const presentCount = attendance.filter(a => a.date === today && a.status === 'حاضر').length;
    const attendanceRate = employees.length > 0 ? (presentCount / employees.length) * 100 : 0;
    
    if (attendanceRate < 70 && employees.length > 0) {
      newNotifications.push({
        id: 'low-attendance',
        type: 'warning',
        title: 'نسبة حضور منخفضة',
        message: `نسبة الحضور اليوم ${Math.round(attendanceRate)}% - أقل من 70%`,
        time: currentTimeString,
        icon: TrendingDown,
        priority: 'medium'
      });
    }

    // تنبيه الموظفين الذين لم يسجلوا خروج
    const employeesWithoutCheckout = employees.filter(emp => {
      const empAttendance = attendance.find(a => a.employeeId === emp.id && a.date === today);
      return empAttendance && empAttendance.checkIn && !empAttendance.checkOut && currentHour >= 17;
    });

    employeesWithoutCheckout.forEach(emp => {
      newNotifications.push({
        id: `no-checkout-${emp.id}`,
        type: 'info',
        title: 'لم يسجل خروج',
        message: `${emp.name} لم يسجل خروج بعد الساعة 5:00 مساءً`,
        time: currentTimeString,
        icon: Clock,
        priority: 'low'
      });
    });

    setNotifications(newNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return Clock;
      case 'info': return Bell;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const dismissAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="relative">
      {/* زر التنبيهات */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* قائمة التنبيهات */}
      {showNotifications && (
        <div className="absolute left-0 top-12 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">التنبيهات</h3>
              {notifications.length > 0 && (
                <button
                  onClick={dismissAllNotifications}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  مسح الكل
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="mx-auto mb-2" size={32} />
                <p>لا توجد تنبيهات</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        <IconComponent size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {notification.title}
                          </h4>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
