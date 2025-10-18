import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// تصدير تقرير يومي
export const exportDailyReport = (attendance, employees, date) => {
  const data = attendance
    .filter(record => record.date === date)
    .map(record => {
      const employee = employees.find(emp => emp.id === record.employeeId);
      return {
        'اسم الموظف': employee?.name || 'غير محدد',
        'القسم': employee?.department || 'غير محدد',
        'التخصص': employee?.specialty || 'غير محدد',
        'وقت الدخول': record.checkIn || '-',
        'وقت الخروج': record.checkOut || '-',
        'الحالة': record.status || 'غير محدد',
        'التاريخ': record.date
      };
    });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير يومي');
  
  // تنسيق الخلايا
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };
  }

  const fileName = `تقرير_حضور_يومي_${date}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

// تصدير تقرير شهري
export const exportMonthlyReport = (attendance, employees, year, month) => {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));
  
  const monthlyData = attendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });

  // تجميع البيانات حسب الموظف
  const employeeStats = {};
  employees.forEach(emp => {
    employeeStats[emp.id] = {
      name: emp.name,
      department: emp.department,
      specialty: emp.specialty,
      presentDays: 0,
      absentDays: 0,
      totalDays: 0
    };
  });

  monthlyData.forEach(record => {
    if (employeeStats[record.employeeId]) {
      employeeStats[record.employeeId].totalDays++;
      if (record.status === 'حاضر') {
        employeeStats[record.employeeId].presentDays++;
      } else if (record.status === 'غائب') {
        employeeStats[record.employeeId].absentDays++;
      }
    }
  });

  const data = Object.values(employeeStats).map(emp => ({
    'اسم الموظف': emp.name,
    'القسم': emp.department,
    'التخصص': emp.specialty,
    'أيام الحضور': emp.presentDays,
    'أيام الغياب': emp.absentDays,
    'إجمالي الأيام': emp.totalDays,
    'نسبة الحضور': emp.totalDays > 0 ? Math.round((emp.presentDays / emp.totalDays) * 100) : 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير شهري');
  
  // تنسيق الخلايا
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "059669" } },
      alignment: { horizontal: "center" }
    };
  }

  const fileName = `تقرير_حضور_شهري_${year}_${month}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

// تصدير تقرير قسمي
export const exportDepartmentReport = (attendance, employees, department) => {
  const deptEmployees = employees.filter(emp => emp.department === department);
  const deptEmployeeIds = deptEmployees.map(emp => emp.id);
  const deptAttendance = attendance.filter(record => deptEmployeeIds.includes(record.employeeId));

  // تجميع البيانات
  const employeeStats = {};
  deptEmployees.forEach(emp => {
    employeeStats[emp.id] = {
      name: emp.name,
      specialty: emp.specialty,
      presentDays: 0,
      absentDays: 0,
      totalDays: 0,
      averageCheckIn: 0,
      averageCheckOut: 0
    };
  });

  deptAttendance.forEach(record => {
    if (employeeStats[record.employeeId]) {
      employeeStats[record.employeeId].totalDays++;
      if (record.status === 'حاضر') {
        employeeStats[record.employeeId].presentDays++;
      } else if (record.status === 'غائب') {
        employeeStats[record.employeeId].absentDays++;
      }
    }
  });

  const data = Object.values(employeeStats).map(emp => ({
    'اسم الموظف': emp.name,
    'التخصص': emp.specialty,
    'أيام الحضور': emp.presentDays,
    'أيام الغياب': emp.absentDays,
    'إجمالي الأيام': emp.totalDays,
    'نسبة الحضور': emp.totalDays > 0 ? Math.round((emp.presentDays / emp.totalDays) * 100) : 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `تقرير قسم ${department}`);
  
  // تنسيق الخلايا
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "DC2626" } },
      alignment: { horizontal: "center" }
    };
  }

  const fileName = `تقرير_قسم_${department}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};

// تصدير تقرير سنوي
export const exportYearlyReport = (attendance, employees, year) => {
  const startDate = startOfYear(new Date(year, 0));
  const endDate = endOfYear(new Date(year, 0));
  
  const yearlyData = attendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });

  // تجميع البيانات حسب الشهر
  const monthlyStats = {};
  for (let month = 1; month <= 12; month++) {
    monthlyStats[month] = {
      month: month,
      presentCount: 0,
      absentCount: 0,
      totalCount: 0
    };
  }

  yearlyData.forEach(record => {
    const recordDate = new Date(record.date);
    const month = recordDate.getMonth() + 1;
    
    monthlyStats[month].totalCount++;
    if (record.status === 'حاضر') {
      monthlyStats[month].presentCount++;
    } else if (record.status === 'غائب') {
      monthlyStats[month].absentCount++;
    }
  });

  const data = Object.values(monthlyStats).map(stat => ({
    'الشهر': stat.month,
    'عدد الحضور': stat.presentCount,
    'عدد الغياب': stat.absentCount,
    'إجمالي السجلات': stat.totalCount,
    'نسبة الحضور': stat.totalCount > 0 ? Math.round((stat.presentCount / stat.totalCount) * 100) : 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تقرير سنوي');
  
  // تنسيق الخلايا
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "7C3AED" } },
      alignment: { horizontal: "center" }
    };
  }

  const fileName = `تقرير_حضور_سنوي_${year}.xlsx`;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), fileName);
};
