console.log('Dashboard.js loaded');

// تحديث التاريخ الحالي
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString('ar-IQ', options);
        dateElement.textContent = currentDate;
    }
}

// تنسيق الأرقام بإضافة فواصل للآلاف
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// تحديث البيانات (يمكن ربطها لاحقاً بقاعدة البيانات)
function updateDashboardData() {
    // تحديث الإيرادات
    const dailyAmount = document.getElementById('daily-amount');
    const monthlyAmount = document.getElementById('monthly-amount');
    const yearlyAmount = document.getElementById('yearly-amount');
    
    if (dailyAmount) dailyAmount.textContent = formatNumber(1500000);
    if (monthlyAmount) monthlyAmount.textContent = formatNumber(45000000);
    if (yearlyAmount) yearlyAmount.textContent = formatNumber(540000000);

    // تحديث بيانات المكاتب
    const activeOffices = document.getElementById('active-offices');
    const dailyWorking = document.getElementById('daily-working');
    const dailyInteraction = document.getElementById('daily-interaction');
    
    if (activeOffices) activeOffices.textContent = '15';
    if (dailyWorking) dailyWorking.textContent = '12';
    if (dailyInteraction) dailyInteraction.textContent = '10';

    // تحديث بيانات الموظفين
    const totalEmployees = document.getElementById('total-employees');
    const activeEmployees = document.getElementById('active-employees');
    
    if (totalEmployees) totalEmployees.textContent = '150';
    if (activeEmployees) activeEmployees.textContent = '120';
}

// تحديث البيانات كل 5 دقائق
function startAutoUpdate() {
    updateDashboardData();
    setInterval(updateDashboardData, 300000); // 5 دقائق
}

// دالة التهيئة الرئيسية
function initDashBoard() {
    console.log('تهيئة لوحة التحكم...');
    updateCurrentDate();
    startAutoUpdate();
}

// تصدير دالة التهيئة
window.initDashBoard = initDashBoard; 