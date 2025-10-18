import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, TrendingUp, Plus, Trash2, LogOut, AlertCircle, Loader, Download, Settings, BarChart3, FileText } from 'lucide-react';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import LoginSystem from './components/LoginSystem';
import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import StudentDashboard from './components/StudentDashboard';

const AttendanceSystem = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  const [offlineMode, setOfflineMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', department: '', specialty: '' });

  // مراجع المجموعات
  const employeesRef = collection(db, 'employees');
  const attendanceRef = collection(db, 'attendance');
  const departmentsRef = collection(db, 'departments');

  const today = new Date().toISOString().split('T')[0];

  // عند التشغيل: استرجاع الجلسة المحفوظة
  useEffect(() => {
    const savedUser = localStorage.getItem('attendanceCurrentUser');
    const savedAuth = localStorage.getItem('attendanceIsAuthenticated');
    if (savedUser && savedAuth === 'true') {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      loadData();
    }
    // eslint-disable-next-line
  }, []);

  // دوال تسجيل الدخول والخروج
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('attendanceCurrentUser', JSON.stringify(user));
    localStorage.setItem('attendanceIsAuthenticated', 'true');
    loadData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('attendanceCurrentUser');
    localStorage.removeItem('attendanceIsAuthenticated');
    setEmployees([]);
    setAttendance([]);
    setDepartments([]);
  };

  // تحميل البيانات
  const loadData = async () => {
    try {
      console.log('فحص الاتصال بـ Firebase...');
      
      const loadPromise = Promise.all([
        loadEmployees(),
        loadAttendance(),
        loadDepartments()
      ]);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 3000)
      );
      
      await Promise.race([loadPromise, timeoutPromise]);
      
    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err);
      setError('فشل الاتصال بـ Firebase. جاري العمل في الوضع المحلي.');
      setOfflineMode(true);
      
      // تحميل البيانات المحلية
      setEmployees([
        { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', department: 'تطوير', specialty: 'Backend', joinDate: today },
        { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', department: 'تصميم', specialty: 'UI/UX', joinDate: today }
      ]);
      setAttendance([]);
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      console.log('محاولة تحميل الموظفين من Firebase...');
      
      // فحص سريع للاتصال
      if (offlineMode) {
        console.log('في وضع عدم الاتصال، تخطي تحميل Firebase');
        setLoading(false);
        return;
      }
      
      // إضافة timeout قصير للطلب
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 2000)
      );
      
      const queryPromise = getDocs(employeesRef);
      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
      
      const emps = [];
      querySnapshot.forEach((doc) => {
        emps.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setEmployees(emps);
      console.log('تم تحميل الموظفين بنجاح:', emps.length);
      setOfflineMode(false);
    } catch (err) {
      console.error('خطأ في تحميل الموظفين:', err);
      setError('فشل الاتصال بـ Firebase. جاري العمل في الوضع المحلي.');
      setOfflineMode(true);
      // إضافة بيانات تجريبية في حالة فشل الاتصال
      setEmployees([
        { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', department: 'تطوير', specialty: 'Backend', joinDate: today },
        { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', department: 'تصميم', specialty: 'UI/UX', joinDate: today }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحميل الطلاب من Firebase
  const loadStudents = async () => {
    try {
      console.log('محاولة تحميل الطلاب من Firebase...');
      if (offlineMode) {
        console.log('في وضع عدم الاتصال، تخطي تحميل Firebase');
        return [];
      }
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 2000)
      );
      const studentsRef = collection(db, 'students');
      const queryPromise = getDocs(studentsRef);
      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
      const students = [];
      querySnapshot.forEach((doc) => {
        students.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log('تم تحميل الطلاب بنجاح:', students.length);
      return students;
    } catch (err) {
      console.error('خطأ في تحميل الطلاب:', err);
      setError('فشل الاتصال بـ Firebase. جاري العمل في الوضع المحلي.');
      setOfflineMode(true);
      return [];
    }
  };

  const loadAttendance = async () => {
    try {
      console.log('محاولة تحميل سجلات الحضور من Firebase...');
      
      // فحص سريع للاتصال
      if (offlineMode) {
        console.log('في وضع عدم الاتصال، تخطي تحميل Firebase');
        return;
      }
      
      // إضافة timeout قصير للطلب
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 2000)
      );
      
      const queryPromise = getDocs(attendanceRef);
      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
      
      const att = [];
      querySnapshot.forEach((doc) => {
        att.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setAttendance(att);
      console.log('تم تحميل سجلات الحضور بنجاح:', att.length);
    } catch (err) {
      console.error('خطأ في تحميل السجلات:', err);
      setError('فشل الاتصال بـ Firebase. جاري العمل في الوضع المحلي.');
      setOfflineMode(true);
      // إضافة بيانات تجريبية في حالة فشل الاتصال
      setAttendance([]);
    }
  };

  const loadDepartments = async () => {
    try {
      console.log('محاولة تحميل الأقسام من Firebase...');
      
      if (offlineMode) {
        console.log('في وضع عدم الاتصال، تخطي تحميل Firebase');
        return;
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 2000)
      );
      
      const queryPromise = getDocs(departmentsRef);
      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);
      
      const depts = [];
      querySnapshot.forEach((doc) => {
        depts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setDepartments(depts);
      console.log('تم تحميل الأقسام بنجاح:', depts.length);
    } catch (err) {
      console.error('خطأ في تحميل الأقسام:', err);
      setError('فشل الاتصال بـ Firebase. جاري العمل في الوضع المحلي.');
      setOfflineMode(true);
      // إضافة بيانات تجريبية
      setDepartments([
        { id: '1', name: 'تطوير', description: 'قسم التطوير', specialties: [
          { id: '1', name: 'Backend', description: 'تطوير الخادم' },
          { id: '2', name: 'Frontend', description: 'تطوير الواجهة' },
          { id: '3', name: 'DevOps', description: 'العمليات والتطوير' }
        ]},
        { id: '2', name: 'تصميم', description: 'قسم التصميم', specialties: [
          { id: '1', name: 'UI/UX', description: 'تصميم واجهة المستخدم' },
          { id: '2', name: 'Graphic Design', description: 'التصميم الجرافيكي' }
        ]},
        { id: '3', name: 'إدارة', description: 'قسم الإدارة', specialties: [
          { id: '1', name: 'HR', description: 'الموارد البشرية' },
          { id: '2', name: 'Finance', description: 'المالية' }
        ]},
        { id: '4', name: 'تسويق', description: 'قسم التسويق', specialties: [
          { id: '1', name: 'Digital Marketing', description: 'التسويق الرقمي' },
          { id: '2', name: 'Content Marketing', description: 'تسويق المحتوى' }
        ]},
        { id: '5', name: 'طالب', description: 'قسم الطلاب', specialties: [
          { id: '1', name: 'طالب جامعي', description: 'طالب في الجامعة' },
          { id: '2', name: 'طالب ثانوي', description: 'طالب في الثانوية' }
        ]}
      ]);
    }
  };

  const addEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    try {
      setSyncStatus('syncing');
      
      const empData = {
        name: newEmployee.name,
        email: newEmployee.email,
        department: newEmployee.department || 'عام',
        specialty: newEmployee.specialty || 'غير محدد',
        joinDate: today,
        createdAt: new Date().toISOString()
      };

      if (offlineMode) {
        // في وضع عدم الاتصال، أضف محلياً فقط
        const newId = Date.now().toString();
        const newEmp = { id: newId, ...empData };
        setEmployees([...employees, newEmp]);
        setNewEmployee({ name: '', email: '', department: '' });
        setShowAddEmployee(false);
        setSyncStatus('synced');
        setError('تم إضافة الموظف محلياً. سيتم المزامنة عند عودة الاتصال.');
      } else {
        await addDoc(employeesRef, empData);
        await loadEmployees();
        setNewEmployee({ name: '', email: '', department: '' });
        setShowAddEmployee(false);
        setSyncStatus('synced');
      }
    } catch (err) {
      setError('خطأ في إضافة الموظف: ' + err.message);
      setSyncStatus('error');
      console.error(err);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setSyncStatus('syncing');
      
      await deleteDoc(doc(db, 'employees', id));
      setEmployees(employees.filter(e => e.id !== id));
      setAttendance(attendance.filter(a => a.employeeId !== id));
      setSyncStatus('synced');
    } catch (err) {
      setError('فشل حذف الموظف: ' + err.message);
      setSyncStatus('error');
    }
  };

  const checkIn = async (employeeId) => {
    try {
      setSyncStatus('syncing');
      const time = new Date().toLocaleTimeString('en-GB').slice(0, 5);
      const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);

      const attData = {
        employeeId: employeeId,
        date: today,
        checkIn: time,
        checkOut: existing?.checkOut || '',
        status: 'حاضر',
        timestamp: new Date().toISOString()
      };

      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), attData);
      } else {
        await addDoc(attendanceRef, attData);
      }
      
      await loadAttendance();
      setSyncStatus('synced');
    } catch (err) {
      setError('فشل تسجيل الدخول: ' + err.message);
      setSyncStatus('error');
    }
  };

  const checkOut = async (employeeId) => {
    try {
      setSyncStatus('syncing');
      const time = new Date().toLocaleTimeString('en-GB').slice(0, 5);
      const record = attendance.find(a => a.employeeId === employeeId && a.date === today);

      if (record) {
        const attData = {
          employeeId: record.employeeId,
          date: record.date,
          checkIn: record.checkIn || '',
          checkOut: time,
          status: record.status,
          timestamp: new Date().toISOString()
        };

        await updateDoc(doc(db, 'attendance', record.id), attData);
        await loadAttendance();
        setSyncStatus('synced');
      }
    } catch (err) {
      setError('فشل تسجيل الخروج: ' + err.message);
      setSyncStatus('error');
    }
  };

  const markAbsent = async (employeeId) => {
    try {
      setSyncStatus('syncing');
      const existing = attendance.find(a => a.employeeId === employeeId && a.date === today);

      const attData = {
        employeeId: employeeId,
        date: today,
        checkIn: '',
        checkOut: '',
        status: 'غائب',
        timestamp: new Date().toISOString()
      };

      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), attData);
      } else {
        await addDoc(attendanceRef, attData);
      }
      
      await loadAttendance();
      setSyncStatus('synced');
    } catch (err) {
      setError('فشل تحديد الغياب: ' + err.message);
      setSyncStatus('error');
    }
  };

  const getTodayAttendance = () => {
    return attendance.filter(a => a.date === today);
  };

  const getEmployeeStats = (employeeId) => {
    const empAttendance = attendance.filter(a => a.employeeId === employeeId);
    const present = empAttendance.filter(a => a.status === 'حاضر').length;
    const absent = empAttendance.filter(a => a.status === 'غائب').length;
    return { present, absent, total: empAttendance.length };
  };

  // عرض شاشة تسجيل الدخول إذا لم يكن المستخدم مسجل دخول
  if (!isAuthenticated) {
    return <LoginSystem onLogin={handleLogin} />;
  }

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-indigo-600" size={40} />
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // عرض لوحة التحكم المناسبة حسب نوع المستخدم
  const dashboardProps = {
    user: currentUser,
    employees,
    attendance,
    departments,
    onLogout: handleLogout,
    onDepartmentChange: () => {
      loadDepartments();
      loadEmployees();
    },
    loadEmployees,
    loadAttendance,
    loadDepartments,
    addEmployee,
    deleteEmployee,
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
  };

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard {...dashboardProps} />;
    case 'manager':
      return <ManagerDashboard {...dashboardProps} />;
    case 'employee':
      return <EmployeeDashboard {...dashboardProps} />;
    case 'student':
      return <StudentDashboard {...dashboardProps} />;
    default:
      return <LoginSystem onLogin={handleLogin} />;
  }
};

export default AttendanceSystem;
