import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Building, GraduationCap, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const EmployeeStudentManagement = ({ currentUser, onEmployeeChange }) => {
  const [employees, setEmployees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    specialty: '',
    password: ''
  });
  
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    department: 'طالب',
    specialty: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const employeesRef = collection(db, 'employees');
  const studentsRef = collection(db, 'students');

  useEffect(() => {
    loadEmployees();
    loadStudents();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(employeesRef);
      const employeesList = [];
      querySnapshot.forEach((doc) => {
        const employee = { id: doc.id, ...doc.data() };
        // عرض الموظفين من نفس القسم فقط
        if (employee.department === currentUser.department) {
          employeesList.push(employee);
        }
      });
      setEmployees(employeesList);
    } catch (err) {
      console.error('خطأ في تحميل الموظفين:', err);
      setError('فشل في تحميل الموظفين');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(studentsRef);
      const studentsList = [];
      querySnapshot.forEach((doc) => {
        const student = { id: doc.id, ...doc.data() };
        // عرض الطلاب من نفس القسم فقط
        if (student.department === currentUser.department) {
          studentsList.push(student);
        }
      });
      setStudents(studentsList);
    } catch (err) {
      console.error('خطأ في تحميل الطلاب:', err);
      setError('فشل في تحميل الطلاب');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      setError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const employeeData = {
        ...newEmployee,
        department: currentUser.department, // استخدام قسم المدير
        role: 'employee',
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      await addDoc(employeesRef, employeeData);
      setNewEmployee({ name: '', email: '', department: '', specialty: '', password: '' });
      setShowAddEmployee(false);
      setError('');
      await loadEmployees();
      onEmployeeChange && onEmployeeChange();
    } catch (err) {
      console.error('خطأ في إضافة الموظف:', err);
      setError('فشل في إضافة الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      setError('الاسم والبريد الإلكتروني وكلمة المرور مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const studentData = {
        ...newStudent,
        department: currentUser.department, // استخدام قسم المدير
        role: 'student',
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      await addDoc(studentsRef, studentData);
      setNewStudent({ name: '', email: '', department: 'طالب', specialty: '', password: '' });
      setShowAddStudent(false);
      setError('');
      await loadStudents();
      onEmployeeChange && onEmployeeChange();
    } catch (err) {
      console.error('خطأ في إضافة الطالب:', err);
      setError('فشل في إضافة الطالب');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee.name || !editingEmployee.email) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    try {
      setLoading(true);
      const employeeRef = doc(employeesRef, editingEmployee.id);
      await updateDoc(employeeRef, {
        name: editingEmployee.name,
        email: editingEmployee.email,
        specialty: editingEmployee.specialty
      });
      setEditingEmployee(null);
      setError('');
      await loadEmployees();
      onEmployeeChange && onEmployeeChange();
    } catch (err) {
      console.error('خطأ في تحديث الموظف:', err);
      setError('فشل في تحديث الموظف');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent.name || !editingStudent.email) {
      setError('الاسم والبريد الإلكتروني مطلوبان');
      return;
    }

    try {
      setLoading(true);
      const studentRef = doc(studentsRef, editingStudent.id);
      await updateDoc(studentRef, {
        name: editingStudent.name,
        email: editingStudent.email,
        specialty: editingStudent.specialty
      });
      setEditingStudent(null);
      setError('');
      await loadStudents();
      onEmployeeChange && onEmployeeChange();
    } catch (err) {
      console.error('خطأ في تحديث الطالب:', err);
      setError('فشل في تحديث الطالب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('هل أنت متأكد من حذف الموظف؟')) {
      try {
        setLoading(true);
        await deleteDoc(doc(employeesRef, employeeId));
        await loadEmployees();
        onEmployeeChange && onEmployeeChange();
      } catch (err) {
        console.error('خطأ في حذف الموظف:', err);
        setError('فشل في حذف الموظف');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('هل أنت متأكد من حذف الطالب؟')) {
      try {
        setLoading(true);
        await deleteDoc(doc(studentsRef, studentId));
        await loadStudents();
        onEmployeeChange && onEmployeeChange();
      } catch (err) {
        console.error('خطأ في حذف الطالب:', err);
        setError('فشل في حذف الطالب');
      } finally {
        setLoading(false);
      }
    }
  };

  const specialties = {
    'تطوير': ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'],
    'تصميم': ['UI/UX', 'Graphic Design', 'Web Design', 'Product Design'],
    'إدارة': ['Project Management', 'Operations', 'Strategy', 'HR'],
    'تسويق': ['Digital Marketing', 'Content Marketing', 'Social Media', 'SEO'],
    'مبيعات': ['Sales Representative', 'Account Manager', 'Sales Manager'],
    'موارد بشرية': ['Recruitment', 'Training', 'Compensation', 'HR Generalist'],
    'محاسبة': ['Financial Accounting', 'Cost Accounting', 'Tax', 'Audit'],
    'دعم فني': ['Technical Support', 'Customer Service', 'Help Desk']
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الموظفين والطلاب</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} /> إضافة موظف
          </button>
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Plus size={20} /> إضافة طالب
          </button>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-2 bg-white rounded-lg shadow p-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
            activeTab === 'employees'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users size={18} /> الموظفين ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-3 rounded font-semibold transition ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <GraduationCap size={18} /> الطلاب ({students.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* عرض الموظفين */}
          {activeTab === 'employees' && employees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">القسم: {employee.department}</span>
                </div>
                {employee.specialty && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">التخصص: {employee.specialty}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  تاريخ الالتحاق: {employee.joinDate}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEmployee(employee)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Edit size={16} /> تعديل
                </button>
                <button
                  onClick={() => handleDeleteEmployee(employee.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </div>
          ))}

          {/* عرض الطلاب */}
          {activeTab === 'students' && students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <GraduationCap className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">القسم: {student.department}</span>
                </div>
                {student.specialty && (
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">التخصص: {student.specialty}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  تاريخ الالتحاق: {student.joinDate}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingStudent(student)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Edit size={16} /> تعديل
                </button>
                <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال إضافة موظف */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">إضافة موظف جديد</h3>
              <button onClick={() => setShowAddEmployee(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <select
                value={newEmployee.specialty}
                onChange={(e) => setNewEmployee({ ...newEmployee, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">اختر التخصص</option>
                {specialties[currentUser.department]?.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleAddEmployee}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => setShowAddEmployee(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة طالب */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">إضافة طالب جديد</h3>
              <button onClick={() => setShowAddStudent(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                placeholder="التخصص (مثل: طالب جامعي، طالب ثانوي)"
                value={newStudent.specialty}
                onChange={(e) => setNewStudent({ ...newStudent, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleAddStudent}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل موظف */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">تعديل الموظف</h3>
              <button onClick={() => setEditingEmployee(null)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={editingEmployee.name}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={editingEmployee.email}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <select
                value={editingEmployee.specialty || ''}
                onChange={(e) => setEditingEmployee({ ...editingEmployee, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">اختر التخصص</option>
                {specialties[currentUser.department]?.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleEditEmployee}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث'}
                </button>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل طالب */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">تعديل الطالب</h3>
              <button onClick={() => setEditingStudent(null)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={editingStudent.name}
                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={editingStudent.email}
                onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                placeholder="التخصص"
                value={editingStudent.specialty || ''}
                onChange={(e) => setEditingStudent({ ...editingStudent, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleEditStudent}
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث'}
                </button>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStudentManagement;
