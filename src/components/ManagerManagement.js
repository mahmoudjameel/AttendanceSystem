import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Building, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const ManagerManagement = ({ onManagerChange }) => {
  const [managers, setManagers] = useState([]);
  const [showAddManager, setShowAddManager] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [newManager, setNewManager] = useState({
    name: '',
    email: '',
    department: '',
    specialty: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const managersRef = collection(db, 'managers');

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(managersRef);
      const managersList = [];
      querySnapshot.forEach((doc) => {
        managersList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setManagers(managersList);
    } catch (err) {
      console.error('خطأ في تحميل مديري الأقسام:', err);
      setError('فشل في تحميل مديري الأقسام');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = async () => {
    if (!newManager.name || !newManager.email || !newManager.department || !newManager.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const managerData = {
        ...newManager,
        role: 'manager',
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      await addDoc(managersRef, managerData);
      setNewManager({ name: '', email: '', department: '', specialty: '', password: '' });
      setShowAddManager(false);
      setError('');
      await loadManagers();
      onManagerChange && onManagerChange();
    } catch (err) {
      console.error('خطأ في إضافة مدير القسم:', err);
      setError('فشل في إضافة مدير القسم');
    } finally {
      setLoading(false);
    }
  };

  const handleEditManager = async () => {
    if (!editingManager.name || !editingManager.email || !editingManager.department) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    try {
      setLoading(true);
      const managerRef = doc(managersRef, editingManager.id);
      await updateDoc(managerRef, {
        name: editingManager.name,
        email: editingManager.email,
        department: editingManager.department,
        specialty: editingManager.specialty
      });
      setEditingManager(null);
      setError('');
      await loadManagers();
      onManagerChange && onManagerChange();
    } catch (err) {
      console.error('خطأ في تحديث مدير القسم:', err);
      setError('فشل في تحديث مدير القسم');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManager = async (managerId) => {
    if (window.confirm('هل أنت متأكد من حذف مدير القسم؟')) {
      try {
        setLoading(true);
        await deleteDoc(doc(managersRef, managerId));
        await loadManagers();
        onManagerChange && onManagerChange();
      } catch (err) {
        console.error('خطأ في حذف مدير القسم:', err);
        setError('فشل في حذف مدير القسم');
      } finally {
        setLoading(false);
      }
    }
  };

  const departments = [
    'تطوير',
    'تصميم',
    'إدارة',
    'تسويق',
    'مبيعات',
    'موارد بشرية',
    'محاسبة',
    'دعم فني'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة مديري الأقسام</h2>
        <button
          onClick={() => setShowAddManager(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={20} /> إضافة مدير قسم
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
          {managers.map((manager) => (
            <div key={manager.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{manager.name}</h3>
                  <p className="text-sm text-gray-500">{manager.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">القسم: {manager.department}</span>
                </div>
                {manager.specialty && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">التخصص: {manager.specialty}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  تاريخ الالتحاق: {manager.joinDate}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingManager(manager)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Edit size={16} /> تعديل
                </button>
                <button
                  onClick={() => handleDeleteManager(manager.id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <Trash2 size={16} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال إضافة مدير قسم */}
      {showAddManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">إضافة مدير قسم جديد</h3>
              <button onClick={() => setShowAddManager(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={newManager.name}
                onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={newManager.email}
                onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="password"
                placeholder="كلمة المرور"
                value={newManager.password}
                onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <select
                value={newManager.department}
                onChange={(e) => setNewManager({ ...newManager, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">اختر القسم</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="التخصص (اختياري)"
                value={newManager.specialty}
                onChange={(e) => setNewManager({ ...newManager, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleAddManager}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  onClick={() => setShowAddManager(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل مدير قسم */}
      {editingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">تعديل مدير القسم</h3>
              <button onClick={() => setEditingManager(null)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={editingManager.name}
                onChange={(e) => setEditingManager({ ...editingManager, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                value={editingManager.email}
                onChange={(e) => setEditingManager({ ...editingManager, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <select
                value={editingManager.department}
                onChange={(e) => setEditingManager({ ...editingManager, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                <option value="">اختر القسم</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="التخصص (اختياري)"
                value={editingManager.specialty || ''}
                onChange={(e) => setEditingManager({ ...editingManager, specialty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleEditManager}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'جاري التحديث...' : 'تحديث'}
                </button>
                <button
                  onClick={() => setEditingManager(null)}
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

export default ManagerManagement;
