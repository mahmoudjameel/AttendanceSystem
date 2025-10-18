import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const VacationReview = ({ currentUser, employees = [], students = [] }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const vacationRequestsRef = collection(db, 'vacationRequests');

  const isSuperAdmin = currentUser.role === 'admin';
  const filterDepartments = isSuperAdmin ? null : currentUser.department;

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, [filterDepartments]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const querySnapshot = await getDocs(vacationRequestsRef);
      let allRequests = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      if (!isSuperAdmin) {
        allRequests = allRequests.filter(req => req.department === filterDepartments);
      }
      allRequests = allRequests.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      setRequests(allRequests);
    } catch (err) {
      setError('فشل تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const requestRef = doc(vacationRequestsRef, id);
      await updateDoc(requestRef, { status });
      setMsg(`تم تحديث حالة الطلب إلى: ${status}`);
      loadRequests();
    } catch {
      setError('فشل تحديث حالة الطلب');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 1500);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">مراجعة طلبات الإجازة</h2>
        <button onClick={loadRequests} className="bg-blue-500 text-white px-4 py-2 rounded-lg">تحديث</button>
      </div>
      {msg && <div className="bg-green-100 border border-green-400 px-4 py-3 rounded">{msg}</div>}
      {error && <div className="bg-red-100 border px-4 py-3 rounded">{error}</div>}

      {loading ? (
        <div className="py-8 text-center">جاري التحميل...</div>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">لا توجد طلبات لمراجعتها</p>
            </div>
          ) : (
            requests.map((req) => {
              const Icon = getStatusIcon(req.status);
              return (
                <div key={req.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-3 items-center mb-2">
                        <Users className="text-indigo-600" size={20}/>
                        <span className="font-semibold text-indigo-700">{req.employeeName || req.employeeEmail}</span>
                        <span className="text-xs rounded bg-blue-50 px-3 py-1 ml-2">{req.type}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)} ml-2`}>
                          <Icon size={14} />{req.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{req.startDate} → {req.endDate} | {req.days} أيام</div>
                      <div className="text-xs text-gray-500">سبب الإجازة: {req.reason}</div>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <button disabled={req.status === 'موافق'} onClick={() => updateStatus(req.id, 'موافق')} className={`py-2 rounded font-bold text-white ${req.status === 'موافق' ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}>موافقة</button>
                      <button disabled={req.status === 'مرفوض'} onClick={() => updateStatus(req.id, 'مرفوض')} className={`py-2 rounded font-bold text-white ${req.status === 'مرفوض' ? 'bg-red-300' : 'bg-red-600 hover:bg-red-700'}`}>رفض</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VacationReview;
