import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';

const VacationRequest = ({ currentUser, onRequestChange }) => {
  const [vacationRequests, setVacationRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newRequest, setNewRequest] = useState({
    startDate: '',
    endDate: '',
    type: 'إجازة عادية',
    reason: '',
    days: 0
  });

  const vacationRequestsRef = collection(db, 'vacationRequests');

  useEffect(() => {
    loadVacationRequests();
  }, []);

  const loadVacationRequests = async () => {
    try {
      setLoading(true);
      let requests = [];
      try {
        // جرب الاستعلام المركب أولاً
        const q = query(
          vacationRequestsRef,
          where('employeeId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          requests.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        // إذا كان الخطأ بسبب الفهارس (index error)
        if (err.code === 'failed-precondition' || String(err).includes('index')) {
          const querySnapshot = await getDocs(vacationRequestsRef);
          // فلترة في الواجهة وترتيب
          requests = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(r => r.employeeId === currentUser.id)
            .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        } else {
          throw err;
        }
      }
      setVacationRequests(requests);
    } catch (err) {
      console.error('خطأ في تحميل طلبات الإجازة:', err);
      setError('فشل في تحميل طلبات الإجازة');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    if (new Date(newRequest.startDate) < new Date()) {
      setError('تاريخ بداية الإجازة يجب أن يكون في المستقبل');
      return;
    }

    if (new Date(newRequest.endDate) < new Date(newRequest.startDate)) {
      setError('تاريخ نهاية الإجازة يجب أن يكون بعد تاريخ البداية');
      return;
    }

    try {
      setLoading(true);
      const days = calculateDays(newRequest.startDate, newRequest.endDate);
      
      const requestData = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        employeeEmail: currentUser.email,
        department: currentUser.department,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        type: newRequest.type,
        reason: newRequest.reason,
        days: days,
        status: 'معلق',
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };

      await addDoc(vacationRequestsRef, requestData);
      
      setNewRequest({
        startDate: '',
        endDate: '',
        type: 'إجازة عادية',
        reason: '',
        days: 0
      });
      
      setShowRequestForm(false);
      setError('');
      setSuccess('تم إرسال طلب الإجازة بنجاح');
      
      await loadVacationRequests();
      onRequestChange && onRequestChange();
      
      // إخفاء رسالة النجاح بعد 3 ثوان
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('خطأ في إرسال طلب الإجازة:', err);
      setError('فشل في إرسال طلب الإجازة');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'موافق': return 'text-green-600 bg-green-100';
      case 'مرفوض': return 'text-red-600 bg-red-100';
      case 'معلق': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'موافق': return CheckCircle;
      case 'مرفوض': return XCircle;
      case 'معلق': return Clock;
      default: return AlertCircle;
    }
  };

  const vacationTypes = [
    'إجازة عادية',
    'إجازة مرضية',
    'إجازة عائلية',
    'إجازة طوارئ',
    'إجازة دراسية',
    'إجازة أمومة',
    'إجازة أبوة'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">طلبات الإجازة</h2>
        <button
          onClick={() => setShowRequestForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Send size={20} /> طلب إجازة جديد
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">جاري التحميل...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vacationRequests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">لا توجد طلبات إجازة</p>
              <p className="text-gray-400 text-sm">اضغط على "طلب إجازة جديد" لإنشاء طلب جديد</p>
            </div>
          ) : (
            vacationRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="text-indigo-600" size={24} />
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{request.type}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(request.startDate).toLocaleDateString('ar-SA')} - {new Date(request.endDate).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">عدد الأيام</p>
                        <p className="font-semibold text-indigo-600">{request.days} يوم</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">تاريخ الإرسال</p>
                        <p className="font-semibold text-gray-800">
                          {new Date(request.submittedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الحالة</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                          {React.createElement(getStatusIcon(request.status), { size: 16 })}
                          {request.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">السبب</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* مودال طلب إجازة جديد */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">طلب إجازة جديد</h3>
              <button onClick={() => setShowRequestForm(false)} className="text-2xl font-bold">×</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الإجازة</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                >
                  {vacationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                  <input
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      const days = calculateDays(startDate, newRequest.endDate);
                      setNewRequest({ ...newRequest, startDate, days });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => {
                      const endDate = e.target.value;
                      const days = calculateDays(newRequest.startDate, endDate);
                      setNewRequest({ ...newRequest, endDate, days });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {newRequest.days > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>عدد أيام الإجازة:</strong> {newRequest.days} يوم
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">سبب الإجازة</label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="اكتب سبب طلب الإجازة..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitRequest}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      إرسال الطلب
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowRequestForm(false)}
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

export default VacationRequest;
