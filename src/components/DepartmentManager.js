import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Building, GraduationCap } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const DepartmentManager = ({ onDepartmentChange }) => {
  const [departments, setDepartments] = useState([]);
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddSpecialty, setShowAddSpecialty] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [newDept, setNewDept] = useState({ name: '', description: '' });
  const [newSpecialty, setNewSpecialty] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const departmentsRef = collection(db, 'departments');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(departmentsRef);
      const depts = [];
      querySnapshot.forEach((doc) => {
        depts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setDepartments(depts);
    } catch (err) {
      console.error('خطأ في تحميل الأقسام:', err);
      setError('خطأ في تحميل الأقسام');
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async () => {
    if (!newDept.name) {
      setError('اسم القسم مطلوب');
      return;
    }

    try {
      const deptData = {
        name: newDept.name,
        description: newDept.description || '',
        specialties: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(departmentsRef, deptData);
      await loadDepartments();
      setNewDept({ name: '', description: '' });
      setShowAddDept(false);
      onDepartmentChange && onDepartmentChange();
    } catch (err) {
      setError('خطأ في إضافة القسم: ' + err.message);
    }
  };

  const addSpecialty = async () => {
    if (!newSpecialty.name || !selectedDept) {
      setError('اسم التخصص والقسم مطلوبان');
      return;
    }

    try {
      const updatedSpecialties = [...(selectedDept.specialties || []), {
        id: Date.now().toString(),
        name: newSpecialty.name,
        description: newSpecialty.description || ''
      }];

      await updateDoc(doc(db, 'departments', selectedDept.id), {
        specialties: updatedSpecialties
      });

      await loadDepartments();
      setNewSpecialty({ name: '', description: '' });
      setShowAddSpecialty(false);
      onDepartmentChange && onDepartmentChange();
    } catch (err) {
      setError('خطأ في إضافة التخصص: ' + err.message);
    }
  };

  const deleteDepartment = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        await deleteDoc(doc(db, 'departments', id));
        await loadDepartments();
        onDepartmentChange && onDepartmentChange();
      } catch (err) {
        setError('خطأ في حذف القسم: ' + err.message);
      }
    }
  };

  const deleteSpecialty = async (deptId, specialtyId) => {
    try {
      const dept = departments.find(d => d.id === deptId);
      const updatedSpecialties = dept.specialties.filter(s => s.id !== specialtyId);
      
      await updateDoc(doc(db, 'departments', deptId), {
        specialties: updatedSpecialties
      });

      await loadDepartments();
      onDepartmentChange && onDepartmentChange();
    } catch (err) {
      setError('خطأ في حذف التخصص: ' + err.message);
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800">إدارة الأقسام والتخصصات</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddDept(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus size={20} /> قسم جديد
          </button>
        </div>
      </div>

      {/* قائمة الأقسام */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{dept.description}</p>
                </div>
              </div>
              <button
                onClick={() => deleteDepartment(dept.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* التخصصات */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-700">التخصصات:</h4>
                <button
                  onClick={() => {
                    setSelectedDept(dept);
                    setShowAddSpecialty(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Plus size={16} /> إضافة تخصص
                </button>
              </div>
              
              {dept.specialties && dept.specialties.length > 0 ? (
                <div className="space-y-1">
                  {dept.specialties.map((specialty) => (
                    <div key={specialty.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-gray-500" />
                        <span className="text-sm">{specialty.name}</span>
                      </div>
                      <button
                        onClick={() => deleteSpecialty(dept.id, specialty.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد تخصصات</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* مودال إضافة قسم */}
      {showAddDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">إضافة قسم جديد</h3>
              <button onClick={() => setShowAddDept(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="اسم القسم"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <textarea
                placeholder="وصف القسم"
                value={newDept.description}
                onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={addDepartment}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddDept(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة تخصص */}
      {showAddSpecialty && selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                إضافة تخصص لـ {selectedDept.name}
              </h3>
              <button onClick={() => setShowAddSpecialty(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="اسم التخصص"
                value={newSpecialty.name}
                onChange={(e) => setNewSpecialty({ ...newSpecialty, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
              />
              <textarea
                placeholder="وصف التخصص"
                value={newSpecialty.description}
                onChange={(e) => setNewSpecialty({ ...newSpecialty, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={addSpecialty}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAddSpecialty(false)}
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

export default DepartmentManager;
