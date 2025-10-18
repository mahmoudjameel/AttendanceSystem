import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, Award, Clock } from 'lucide-react';

const AdvancedStats = ({ employees, attendance, selectedPeriod = 'month' }) => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);

  useEffect(() => {
    calculateStats();
  }, [employees, attendance, selectedPeriod]);

  const calculateStats = () => {
    const currentDate = new Date();
    const startDate = getStartDate(selectedPeriod, currentDate);
    const endDate = currentDate;

    // فلترة البيانات حسب الفترة المحددة
    const filteredAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    // حساب الإحصائيات العامة
    const totalDays = getDaysInPeriod(selectedPeriod);
    const presentCount = filteredAttendance.filter(a => a.status === 'حاضر').length;
    const absentCount = filteredAttendance.filter(a => a.status === 'غائب').length;
    const attendanceRate = totalDays > 0 ? (presentCount / (totalDays * employees.length)) * 100 : 0;

    // حساب إحصائيات الموظفين
    const employeeStats = employees.map(emp => {
      const empAttendance = filteredAttendance.filter(a => a.employeeId === emp.id);
      const presentDays = empAttendance.filter(a => a.status === 'حاضر').length;
      const absentDays = empAttendance.filter(a => a.status === 'غائب').length;
      const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        specialty: emp.specialty,
        presentDays,
        absentDays,
        attendanceRate: Math.round(attendanceRate)
      };
    });

    // ترتيب الموظفين حسب الأداء
    const sortedEmployees = employeeStats.sort((a, b) => b.attendanceRate - a.attendanceRate);
    const topPerformers = sortedEmployees.slice(0, 5);

    // حساب إحصائيات الأقسام
    const departmentStats = calculateDepartmentStats(employeeStats);

    // إعداد بيانات الرسوم البيانية
    const chartData = prepareChartData(filteredAttendance, selectedPeriod);

    setStats({
      totalDays,
      presentCount,
      absentCount,
      attendanceRate: Math.round(attendanceRate),
      totalEmployees: employees.length
    });

    setChartData(chartData);
    setDepartmentStats(departmentStats);
    setTopPerformers(topPerformers);
  };

  const getStartDate = (period, currentDate) => {
    switch (period) {
      case 'week':
        return new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        return new Date(currentDate.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(currentDate.getFullYear(), 0, 1);
      default:
        return new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const getDaysInPeriod = (period) => {
    const currentDate = new Date();
    const startDate = getStartDate(period, currentDate);
    const diffTime = Math.abs(currentDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDepartmentStats = (employeeStats) => {
    const deptMap = {};
    
    employeeStats.forEach(emp => {
      if (!deptMap[emp.department]) {
        deptMap[emp.department] = {
          department: emp.department,
          totalEmployees: 0,
          totalPresentDays: 0,
          totalAbsentDays: 0,
          averageAttendanceRate: 0
        };
      }
      
      deptMap[emp.department].totalEmployees++;
      deptMap[emp.department].totalPresentDays += emp.presentDays;
      deptMap[emp.department].totalAbsentDays += emp.absentDays;
    });

    // حساب متوسط نسبة الحضور لكل قسم
    Object.values(deptMap).forEach(dept => {
      dept.averageAttendanceRate = dept.totalEmployees > 0 
        ? Math.round(dept.totalPresentDays / (dept.totalPresentDays + dept.totalAbsentDays) * 100)
        : 0;
    });

    return Object.values(deptMap);
  };

  const prepareChartData = (attendance, period) => {
    const data = [];
    const currentDate = new Date();
    const startDate = getStartDate(period, currentDate);
    
    // تجميع البيانات حسب الفترة
    if (period === 'week' || period === 'month') {
      for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayAttendance = attendance.filter(a => a.date === dateStr);
        const presentCount = dayAttendance.filter(a => a.status === 'حاضر').length;
        const absentCount = dayAttendance.filter(a => a.status === 'غائب').length;
        
        data.push({
          date: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount
        });
      }
    } else {
      // للفترات الأطول، تجميع حسب الأسابيع
      const weeks = [];
      for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 7)) {
        const weekEnd = new Date(d);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekAttendance = attendance.filter(a => {
          const recordDate = new Date(a.date);
          return recordDate >= d && recordDate <= weekEnd;
        });
        
        const presentCount = weekAttendance.filter(a => a.status === 'حاضر').length;
        const absentCount = weekAttendance.filter(a => a.status === 'غائب').length;
        
        weeks.push({
          week: `الأسبوع ${weeks.length + 1}`,
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount
        });
      }
      return weeks;
    }
    
    return data;
  };

  const COLORS = ['#4F46E5', '#059669', '#DC2626', '#7C3AED', '#EA580C'];

  return (
    <div className="space-y-6">
      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">نسبة الحضور</p>
              <p className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">أيام الحضور</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.presentCount}</p>
            </div>
            <Calendar className="text-indigo-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">أيام الغياب</p>
              <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
            </div>
            <Clock className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني للحضور حسب التاريخ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">الحضور حسب التاريخ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#059669" name="حاضر" />
              <Bar dataKey="absent" fill="#DC2626" name="غائب" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* رسم بياني للأقسام */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">نسبة الحضور حسب القسم</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ department, averageAttendanceRate }) => `${department}: ${averageAttendanceRate}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="averageAttendanceRate"
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* أفضل الموظفين */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">أفضل الموظفين أداءً</h3>
        <div className="space-y-3">
          {topPerformers.map((emp, index) => (
            <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.department} - {emp.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                <span className="font-semibold text-gray-800">{emp.attendanceRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* إحصائيات الأقسام */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">إحصائيات الأقسام</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-right py-3 px-4 font-semibold text-gray-800">القسم</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800">عدد الموظفين</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800">أيام الحضور</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-800">نسبة الحضور</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-800">{dept.department}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.totalEmployees}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.totalPresentDays}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      dept.averageAttendanceRate >= 90 ? 'bg-green-100 text-green-800' :
                      dept.averageAttendanceRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dept.averageAttendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
