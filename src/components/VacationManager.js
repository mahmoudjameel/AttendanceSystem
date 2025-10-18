import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Clock, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

const VacationManager = ({ employees, currentUser }) => {
  const [vacations, setVacations] = useState([]);
  const [showAddVacation, setShowAddVacation] = useState(false);
  const [newVacation, setNewVacation] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    type: 'إجازة عادية',
    reason: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const vacationsRef = collection(db, 'vacations');

  useEffect(() => {
    loadVacations();
  }, []);

  const loadVacations = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(vacationsRef);
      const vacs = [];
      querySnapshot.forEach((doc) => {
        vacs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setVacations(vacs);
    } catch (err) {
      console.error('خطأ في تحميل الإجازات:', err);
      setError('خطأ في تحميل الإجازات');
    } finally {
      setLoading(false);
    }
  };

  const addVacation = async () => {
    if (!newVacation.employeeId || !newVacation.startDate || !newVacation.endDate) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    try {
      const vacationData = {
        ...newVacation,
        createdAt: new Date().toISOString(),
        requestedBy: currentUser?.id || 'system'
      };

      await addDoc(vacationsRef, vacationData);
      await loadVacations();
      setNewVacation({
        employeeId: '',
        startDate: '',
        endDate: '',
        type: 'إجازة عادية',
        reason: '',
        status: 'pending'
      });
      setShowAddVacation(false);
    } catch (err) {
      setError('خطأ في إضافة الإجازة: ' + err.message);
    }
  };

  const updateVacationStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'vacations', id), {
        status: status,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.id || 'system'
      });
      await loadVacations();
    } catch (err) {
      setError('خطأ في تحديث حالة الإجازة: ' + err.message);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'غير محدد';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'موافق عليها';
      case 'rejected': return 'مرفوضة';
      case 'pending': return 'في الانتظار';
      default: return 'غير محدد';
    }
  };

  const filteredVacations = vacations.filter(vacation => {
    if (filter === 'all') return true;
    return vacation.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* تنبيه الخطأ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError('')} className="mr-auto font-bold text-xl">×</button>
        </div>
      )}

      {/* الرأس */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة الإجازات</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
          >
            <option value="all">جميع الإجازات</option>
            <option value="pending">في الانتظار</option>
            <option value="approved">موافق عليها</option>
            <option value="rejected">مرفوضة</option>
          </select>
          <button
            onClick={() => setShowAddVacation(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={20} /> طلب إجازة
          </button>
        </div>
      </div>

      {/* قائمة الإجازات */}
      <div className="space-y-4">
        {filteredVacations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">لا توجد إجازات</p>
          </div>
        ) : (
          filteredVacations.map((vacation) => (
            <div key={vacation.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-gray-500" size={20} />
                    <h3 className="font-bold text-lg text-gray-800">
                      {getEmployeeName(vacation.employeeId)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(vacation.status)}`}>
                      {getStatusText(vacation.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">نوع الإجازة:</span>
                      <span className="font-semibold mr-2">{vacation.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">من:</span>
                      <span className="font-semibold mr-2">{vacation.startDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">إلى:</span>
                      <span className="font-semibold mr-2">{vacation.endDate}</span>
                    </div>
                  </div>
                  
                  {vacation.reason && (
                    <div className="mt-2">
                      <span className="text-gray-600">السبب:</span>
                      <p className="text-gray-800 mt-1">{vacation.reason}</p>
                    </div>
                  )}
                </div>
                
                {vacation.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateVacationStatus(vacation.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <Check size={18} /> موافقة
                    </button>
                    <button
                      onClick={() => updateVacationStatus(vacation.id, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                      <X size={18} /> رفض
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* مودال إضافة إجازة */}
      {showAddVacation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">طلب إجازة</h3>
              <button onClick={() => setShowAddVacation(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <select
                value={newVacation.employeeId}
                onChange={(e) => setNewVacation({ ...newVacation, employeeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">اختر الموظف</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
              
              <select
                value={newVacation.type}
                onChange={(e) => setNewVacation({ ...newVacation, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="إجازة عادية">إجازة عادية</option>
                <option value="إجازة مرضية">إجازة مرضية</option>
                <option value="إجازة طوارئ">إجازة طوارئ</option>
                <option value="إجازة زواج">إجازة زواج</option>
                <option value="إجازة وفاة">إجازة وفاة</option>
              </select>
              
              <input
                type="date"
                placeholder="تاريخ البداية"
                value={newVacation.startDate}
                onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              <input
                type="date"
                placeholder="تاريخ النهاية"
                value={newVacation.endDate}
                onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              <textarea
                placeholder="سبب الإجازة"
                value={newVacation.reason}
                onChange={(e) => setNewVacation({ ...newVacation, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                rows="3"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={addVacation}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  إرسال الطلب
                </button>
                <button
                  onClick={() => setShowAddVacation(false)}
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

export default VacationManager;
