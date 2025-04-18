// تحديث التاريخ الحالي
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Baghdad'
    };
    document.getElementById('current-date').textContent = now.toLocaleDateString('ar', options);
}

// تحديث المبالغ
function updateAmounts() {
    // بيانات تجريبية بالدينار العراقي
    const dailyAmount = 3500000; // 3.5 مليون دينار
    const monthlyAmount = 105000000; // 105 مليون دينار
    const yearlyAmount = 1260000000; // 1.26 مليار دينار

    document.getElementById('daily-amount').textContent = dailyAmount.toLocaleString('ar-IQ');
    document.getElementById('monthly-amount').textContent = monthlyAmount.toLocaleString('ar-IQ');
    document.getElementById('yearly-amount').textContent = yearlyAmount.toLocaleString('ar-IQ');
}

// تحديث إحصائيات المكاتب
function updateOfficeStats() {
    // بيانات تجريبية للمكاتب
    const activeOffices = 150; // إجمالي المكاتب النشطة
    const dailyWorking = 145; // المكاتب العاملة اليوم
    const dailyInteraction = 140; // المكاتب التي لديها تفاعل اليوم
    const totalEmployees = 450; // إجمالي الموظفين المسجلين
    const activeEmployees = 420; // الموظفين النشطين حالياً

    document.getElementById('active-offices').textContent = activeOffices.toLocaleString('ar-IQ');
    document.getElementById('daily-working').textContent = dailyWorking.toLocaleString('ar-IQ');
    document.getElementById('daily-interaction').textContent = dailyInteraction.toLocaleString('ar-IQ');
    document.getElementById('total-employees').textContent = totalEmployees.toLocaleString('ar-IQ');
    document.getElementById('active-employees').textContent = activeEmployees.toLocaleString('ar-IQ');
}

// إنشاء رسم الأداء حسب المناطق
function createRegionalPerformanceChart() {
    const ctx = document.getElementById('regional-performance').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['بغداد', 'البصرة', 'الموصل', 'كركوك', 'ديالى', 'النجف', 'كربلاء'],
            datasets: [{
                label: 'الإيرادات (مليون دينار)',
                data: [450, 320, 280, 150, 120, 200, 180],
                backgroundColor: [
                    '#2ecc71',
                    '#2ecc71',
                    '#2ecc71',
                    '#f1c40f',
                    '#e74c3c',
                    '#2ecc71',
                    '#2ecc71'
                ],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-IQ') + ' د.ع';
                        }
                    }
                }
            }
        }
    });
}

// تهيئة الداشبورد
function initDashboard() {
    updateCurrentDate();
    updateAmounts();
    updateOfficeStats();
    createRegionalPerformanceChart();
}

// تشغيل الداشبورد عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initDashboard); 