// تعريف المتغيرات العامة
let currentPage = 1;
const itemsPerPage = 10;
let revenueData = [];

// دالة تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadRevenueData();
    setupEventListeners();
    // إضافة معالج النموذج
    const form = document.getElementById('revenueForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// دالة تهيئة علامات التبويب
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // إزالة الفئة النشطة من جميع التبويبات
            tabs.forEach(t => t.classList.remove('active'));
            // إضافة الفئة النشطة للتبويب المحدد
            tab.classList.add('active');
            // إخفاء جميع الأقسام
            document.querySelectorAll('.form-section').forEach(section => {
                section.style.display = 'none';
            });
            // إظهار القسم المحدد
            const targetSection = document.getElementById(`${tab.dataset.tab}-section`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

// دالة إعداد مستمعي الأحداث
function setupEventListeners() {
    // إعداد مستمعي أحداث البحث
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
}

// دالة تبديل حقول الدفع
function togglePaymentFields(section, paymentType) {
    const cashFields = document.querySelectorAll(`#${section}-section .cash-fields`);
    const electronicFields = document.querySelectorAll(`#${section}-section .electronic-fields`);

    if (paymentType === 'cash') {
        cashFields.forEach(field => field.style.display = 'block');
        electronicFields.forEach(field => field.style.display = 'none');
    } else if (paymentType === 'electronic') {
        cashFields.forEach(field => field.style.display = 'none');
        electronicFields.forEach(field => field.style.display = 'block');
    }
}

// دالة حساب المجموع لكل قسم
function calculateSectionTotal(section) {
    let total = 0;
    const sectionElement = document.getElementById(`${section}-section`);
    
    // حساب المجموع بناءً على نوع القسم
    switch(section) {
        case 'parcels':
            total = calculateParcelsTotal(sectionElement);
            break;
        case 'stamps':
            total = calculateStampsTotal(sectionElement);
            break;
        case 'boxes':
            total = calculateBoxesTotal(sectionElement);
            break;
        case 'envelopes':
            total = calculateEnvelopesTotal(sectionElement);
            break;
        case 'rent':
            total = calculateRentTotal(sectionElement);
            break;
        case 'misc':
            total = calculateMiscTotal(sectionElement);
            break;
    }

    // تحديث عرض المجموع
    const totalElement = document.getElementById(`${section}Total`);
    if (totalElement) {
        totalElement.textContent = `${total} د.ع`;
    }
}

// دوال حساب المجموع لكل قسم
function calculateParcelsTotal(section) {
    const paymentType = section.querySelector('[name="parcelPaymentType"]').value;
    if (paymentType === 'cash') {
        const stampsAmount = parseFloat(section.querySelector('[name="parcelStampsAmount"]').value) || 0;
        const parcelCount = parseFloat(section.querySelector('[name="parcelCount"]').value) || 0;
        return stampsAmount + parcelCount;
    } else {
        const electronicStamps = parseFloat(section.querySelector('[name="electronicParcelStamps"]').value) || 0;
        const electronicCount = parseFloat(section.querySelector('[name="electronicParcelCount"]').value) || 0;
        return electronicStamps + electronicCount;
    }
}

function calculateStampsTotal(section) {
    const paymentType = section.querySelector('[name="stampPaymentType"]').value;
    if (paymentType === 'cash') {
        return parseFloat(section.querySelector('[name="stampAmount"]').value) || 0;
    } else {
        return parseFloat(section.querySelector('[name="electronicStampAmount"]').value) || 0;
    }
}

function calculateBoxesTotal(section) {
    const paymentType = section.querySelector('[name="boxPaymentType"]').value;
    if (paymentType === 'cash') {
        const rentAmount = parseFloat(section.querySelector('[name="boxRentAmount"]').value) || 0;
        const insuranceAmount = parseFloat(section.querySelector('[name="boxInsuranceAmount"]').value) || 0;
        return rentAmount + insuranceAmount;
    } else {
        const electronicRent = parseFloat(section.querySelector('[name="electronicBoxRentAmount"]').value) || 0;
        const electronicInsurance = parseFloat(section.querySelector('[name="electronicBoxInsuranceAmount"]').value) || 0;
        return electronicRent + electronicInsurance;
    }
}

function calculateEnvelopesTotal(section) {
    const paymentType = section.querySelector('[name="envelopePaymentType"]').value;
    if (paymentType === 'cash') {
        return parseFloat(section.querySelector('[name="envelopeTotalAmount"]').value) || 0;
    } else {
        return parseFloat(section.querySelector('[name="electronicEnvelopeTotalAmount"]').value) || 0;
    }
}

function calculateRentTotal(section) {
    return parseFloat(section.querySelector('[name="rentAmount"]').value) || 0;
}

function calculateMiscTotal(section) {
    return parseFloat(section.querySelector('[name="miscAmount"]').value) || 0;
}

// دالة معالجة تقديم النموذج
function handleFormSubmit(event) {
    event.preventDefault();
    console.log('تم تقديم النموذج');
    
    // التحقق من القسم النشط
    const activeSection = getActiveSection();
    if (!activeSection) {
        showNotification('لم يتم تحديد قسم نشط', 'error');
        return;
    }

    console.log('القسم النشط:', activeSection);

    // جمع بيانات النموذج
    const formData = new FormData(event.target);
    const formDataObj = {};
    
    // تحويل FormData إلى كائن
    for (let [key, value] of formData.entries()) {
        formDataObj[key] = value;
        console.log(`حقل: ${key}, قيمة: ${value}`);
    }

    // إضافة نوع الدفع إلى البيانات
    let paymentTypeField;
    switch(activeSection) {
        case 'parcels':
            paymentTypeField = 'parcelPaymentType';
            break;
        case 'stamps':
            paymentTypeField = 'stampPaymentType';
            break;
        case 'boxes':
            paymentTypeField = 'boxPaymentType';
            break;
        case 'envelopes':
            paymentTypeField = 'envelopePaymentType';
            break;
        default:
            paymentTypeField = null;
    }

    const paymentTypeSelect = event.target.querySelector(`select[name="${paymentTypeField}"]`);
    
    if (paymentTypeSelect) {
        const paymentType = paymentTypeSelect.value;
        formDataObj[paymentTypeField] = paymentType;
        console.log(`نوع الدفع: ${paymentType}`);
        
        // لا نحتاج إلى نسخ القيم هنا لأن الحقول الإلكترونية لها أسماء مختلفة
    } else {
        console.log('لم يتم العثور على حقل نوع الدفع في النموذج');
    }

    console.log('Form Data Object:', formDataObj);

    // التحقق من البيانات المطلوبة
    if (!validateFormData(formDataObj, activeSection)) {
        console.log('فشل التحقق من البيانات');
        return;
    }

    const revenueEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: activeSection,
        data: formDataObj,
        lastModified: null
    };

    console.log('Revenue Entry:', revenueEntry);

    // إضافة البيانات إلى المصفوفة
    revenueData.push(revenueEntry);
    
    console.log('Revenue Data Length:', revenueData.length);
    console.log('Revenue Data:', revenueData);
    
    // تحديث الجدول
    updateRevenueTable();
    
    // إعادة تعيين النموذج
    resetForm();
    
    // عرض رسالة نجاح
    showNotification('تم حفظ البيانات بنجاح', 'success');
}

// دالة التحقق من صحة البيانات
function validateFormData(data, section) {
    console.log('بدء التحقق من البيانات للقسم:', section);
    console.log('البيانات المراد التحقق منها:', data);
    
    // التحقق من وسيلة الدفع للأقسام التي تحتاجها
    if (['parcels', 'stamps', 'boxes', 'envelopes'].includes(section)) {
        let paymentTypeField;
        switch(section) {
            case 'parcels':
                paymentTypeField = 'parcelPaymentType';
                break;
            case 'stamps':
                paymentTypeField = 'stampPaymentType';
                break;
            case 'boxes':
                paymentTypeField = 'boxPaymentType';
                break;
            case 'envelopes':
                paymentTypeField = 'envelopePaymentType';
                break;
        }
        
        const paymentType = data[paymentTypeField];
        
        console.log('حقل وسيلة الدفع:', paymentTypeField);
        console.log('قيمة وسيلة الدفع:', paymentType);
        
        if (!paymentType || paymentType === '') {
            showNotification('الرجاء اختيار وسيلة الدفع', 'error');
            return false;
        }

        // التحقق من الحقول حسب وسيلة الدفع
        if (paymentType === 'cash') {
            console.log('التحقق من الحقول النقدية للقسم:', section);
            if (section === 'parcels') {
                const missingFields = [];
                if (!data.parcelStampsAmount) missingFields.push('مبلغ طوابع الطرود');
                if (!data.parcelCount) missingFields.push('الحزم والرزم');
                if (!data.parcelReceiptNumber) missingFields.push('رقم الوصل');
                if (!data.parcelReceiptDate) missingFields.push('التاريخ');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                    return false;
                }
            } else if (section === 'stamps') {
                const missingFields = [];
                if (!data.stampAmount) missingFields.push('مبلغ الطوابع');
                if (!data.stampReceiptNumber) missingFields.push('رقم الوصل');
                if (!data.stampReceiptDate) missingFields.push('التاريخ');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                    return false;
                }
            } else if (section === 'boxes') {
                const missingFields = [];
                if (!data.boxRentAmount) missingFields.push('مبلغ الإيجار');
                if (!data.boxInsuranceAmount) missingFields.push('مبلغ التأمين');
                if (!data.boxReceiptNumber) missingFields.push('رقم الوصل');
                if (!data.boxCreationDate) missingFields.push('التاريخ');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
            }
            } else if (section === 'envelopes') {
                const missingFields = [];
                if (!data.envelopeTotalAmount) missingFields.push('المبلغ الإجمالي');
                if (!data.envelopeReceiptNumber) missingFields.push('رقم الوصل');
                if (!data.envelopeCreationDate) missingFields.push('التاريخ');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
                }
            }
        } else if (paymentType === 'electronic') {
            console.log('التحقق من الحقول الإلكترونية للقسم:', section);
            if (section === 'parcels') {
                const missingFields = [];
                if (!data.electronicParcelStamps) missingFields.push('مبلغ طوابع الطرود إلكتروني');
                if (!data.electronicParcelCount) missingFields.push('الحزم والرزم إلكتروني');
                if (!data.electronicParcelReceiptNumber) missingFields.push('رقم الوصل إلكتروني');
                if (!data.electronicParcelReceiptDate) missingFields.push('التاريخ إلكتروني');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                    return false;
                }
            } else if (section === 'stamps') {
                const missingFields = [];
                if (!data.electronicStampAmount) missingFields.push('مبلغ الطوابع إلكتروني');
                if (!data.electronicStampReceiptNumber) missingFields.push('رقم الوصل إلكتروني');
                if (!data.electronicStampCreationDate) missingFields.push('التاريخ إلكتروني');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                    return false;
                }
            } else if (section === 'boxes') {
                const missingFields = [];
                if (!data.electronicBoxRentAmount) missingFields.push('مبلغ الإيجار إلكتروني');
                if (!data.electronicBoxInsuranceAmount) missingFields.push('مبلغ التأمين إلكتروني');
                if (!data.electronicBoxReceiptNumber) missingFields.push('رقم الوصل إلكتروني');
                if (!data.electronicBoxCreationDate) missingFields.push('التاريخ إلكتروني');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
            }
            } else if (section === 'envelopes') {
                const missingFields = [];
                if (!data.electronicEnvelopeTotalAmount) missingFields.push('المبلغ الإجمالي إلكتروني');
                if (!data.electronicEnvelopeReceiptNumber) missingFields.push('رقم الوصل إلكتروني');
                if (!data.electronicEnvelopeCreationDate) missingFields.push('التاريخ إلكتروني');
                
                if (missingFields.length > 0) {
                    showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
                }
            }
        }
    } else if (section === 'rent') {
        // التحقق من حقول قسم إيجار المباني
        const missingFields = [];
        if (!data.rentAmount) missingFields.push('مبلغ الإيجار');
        if (!data.rentReceiptNumber) missingFields.push('رقم الوصل');
        
        if (missingFields.length > 0) {
            showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
            }
        } else if (section === 'misc') {
        // التحقق من حقول قسم المتنوعات
        const missingFields = [];
        if (!data.miscAmount) missingFields.push('المبلغ');
        if (!data.miscReceiptNumber) missingFields.push('رقم الوصل');
        
        if (missingFields.length > 0) {
            showNotification(`الحقول المفقودة: ${missingFields.join(', ')}`, 'error');
                return false;
        }
    }

    return true;
}

// دالة الحصول على القسم النشط
function getActiveSection() {
    const activeTab = document.querySelector('.tab.active');
    console.log('التبويب النشط:', activeTab);
    
    if (!activeTab) {
        showNotification('الرجاء اختيار نوع الإيراد', 'error');
        return null;
    }
    
    const section = activeTab.dataset.tab;
    console.log('القسم النشط:', section);
    return section;
}

// دالة تحديث جدول الإيرادات
function updateRevenueTable(filteredData = null) {
    const tableBody = document.getElementById('revenueTableBody');
    const tableHeader = document.querySelector('.revenue-table thead');
    
    if (!tableBody || !tableHeader) return;
    
    // إضافة تنسيقات للشريط العلوي
    tableHeader.style.cssText = `
        position: sticky;
        top: 0;
        z-index: 100;
        background-color: #1a237e;
    `;
    
    // تنسيق خلايا الشريط العلوي
    const headerCells = tableHeader.querySelectorAll('th');
    headerCells.forEach(cell => {
        cell.style.cssText = `
            position: sticky;
            top: 0;
            background-color: #1a237e;
            color: white;
            padding: 15px;
            font-weight: 600;
            text-align: right;
            border-bottom: 2px solid #dee2e6;
            white-space: nowrap;
        `;
    });
    
    // استخدام البيانات المصفاة إذا تم تمريرها، وإلا استخدام البيانات الكاملة
    const dataToDisplay = filteredData || revenueData;

    // حساب نطاق العناصر للصفحة الحالية
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = dataToDisplay.slice(startIndex, endIndex);

    // تحديث محتوى الجدول
    if (pageData.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="8">
                    <i class="fas fa-receipt"></i>
                    <p>لا توجد بيانات إيرادات</p>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = pageData.map((entry, index) => {
            // الحصول على نوع الدفع ورقم الوصل من البيانات
            let paymentType = '-';
            let receiptNumber = '-';
            
            // تحديد نوع الدفع ورقم الوصل بناءً على نوع الإيراد
            switch(entry.type) {
                case 'parcels':
                    paymentType = entry.data.parcelPaymentType === 'cash' ? 'دفع نقدي' : 'دفع إلكتروني';
                    receiptNumber = entry.data.parcelPaymentType === 'cash' 
                        ? entry.data.parcelReceiptNumber 
                        : entry.data.electronicParcelReceiptNumber;
                    break;
                case 'stamps':
                    paymentType = entry.data.stampPaymentType === 'cash' ? 'دفع نقدي' : 'دفع إلكتروني';
                    receiptNumber = entry.data.stampPaymentType === 'cash' 
                        ? entry.data.stampReceiptNumber 
                        : entry.data.electronicStampReceiptNumber;
                    break;
                case 'boxes':
                    paymentType = entry.data.boxPaymentType === 'cash' ? 'دفع نقدي' : 'دفع إلكتروني';
                    receiptNumber = entry.data.boxPaymentType === 'cash' 
                        ? entry.data.boxReceiptNumber 
                        : entry.data.electronicBoxReceiptNumber;
                    break;
                case 'envelopes':
                    paymentType = entry.data.envelopePaymentType === 'cash' ? 'دفع نقدي' : 'دفع إلكتروني';
                    receiptNumber = entry.data.envelopePaymentType === 'cash' 
                        ? entry.data.envelopeReceiptNumber 
                        : entry.data.electronicEnvelopeReceiptNumber;
                    break;
                case 'rent':
                    paymentType = 'دفع نقدي'; // إيجار المباني لا يحتوي على خيار الدفع الإلكتروني
                    receiptNumber = entry.data.rentReceiptNumber;
                    break;
                case 'misc':
                    paymentType = 'دفع نقدي'; // المتنوعات لا تحتوي على خيار الدفع الإلكتروني
                    receiptNumber = entry.data.miscReceiptNumber;
                    break;
            }
            
            return `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${paymentType}</td>
                    <td>${getRevenueTypeName(entry.type)}</td>
                    <td>${receiptNumber || '-'}</td>
                    <td>${calculateEntryTotal(entry)} د.ع</td>
                    <td>${formatDate(entry.timestamp)}</td>
                    <td>${entry.lastModified ? formatDate(entry.lastModified) : '-'}</td>
                    <td class="actions">
                        <button onclick="editEntry(${entry.id})" class="btn-edit" title="تعديل">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button onclick="deleteEntry(${entry.id})" class="btn-delete" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // تحديث معلومات الصفحات
    updatePagination(dataToDisplay);
}

// دالة تحديث التنقل بين الصفحات
function updatePagination(dataToDisplay = null) {
    const data = dataToDisplay || revenueData;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;

    // تحديث حالة أزرار التنقل
    const prevButton = document.querySelector('.pagination button:first-child');
    const nextButton = document.querySelector('.pagination button:last-child');
    
    if (prevButton) prevButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;
}

// دالة تغيير الصفحة
function changePage(direction) {
    const totalPages = Math.ceil(revenueData.length / itemsPerPage);
    
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
    } else if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    }
    
    updateRevenueTable();
}

// دالة إعادة تعيين النموذج
function resetForm() {
    const form = document.getElementById('revenueForm');
    if (form) {
        form.reset();
        // إعادة تعيين جميع المجاميع
        ['parcels', 'stamps', 'boxes', 'envelopes', 'rent', 'misc'].forEach(section => {
            const totalElement = document.getElementById(`${section}Total`);
            if (totalElement) {
                totalElement.textContent = '0 د.ع';
            }
        });
    }
}


// دالة معالجة البحث
function handleSearch() {
    const typeSearch = document.getElementById('revenueTypeSearch').value;
    const receiptSearch = document.getElementById('receiptNumberSearch').value;
    const paymentSearch = document.getElementById('paymentTypeSearch').value;

    // تصفية البيانات
    const filteredData = revenueData.filter(entry => {
        const matchesType = !typeSearch || entry.type === typeSearch;
        const matchesReceipt = !receiptSearch || entry.data.receiptNumber?.includes(receiptSearch);
        const matchesPayment = !paymentSearch || entry.data.paymentType === paymentSearch;
        return matchesType && matchesReceipt && matchesPayment;
    });

    // تحديث الجدول بالبيانات المصفاة
    updateRevenueTable(filteredData);
}

// دوال مساعدة
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ');
}

function getRevenueTypeName(type) {
    const types = {
        parcels: 'الطرود البريدية',
        stamps: 'طوابع الطرود',
        boxes: 'الصناديق البريدية',
        envelopes: 'المظاريف',
        rent: 'إيجار المباني',
        misc: 'متنوعات'
    };
    return types[type] || type;
}

function calculateEntryTotal(entry) {
    // حساب المجموع بناءً على نوع الإيراد
    switch(entry.type) {
        case 'parcels':
            return calculateParcelsTotalFromData(entry.data);
        case 'stamps':
            return calculateStampsTotalFromData(entry.data);
        case 'boxes':
            return calculateBoxesTotalFromData(entry.data);
        case 'envelopes':
            return calculateEnvelopesTotalFromData(entry.data);
        case 'rent':
            return calculateRentTotalFromData(entry.data);
        case 'misc':
            return calculateMiscTotalFromData(entry.data);
        default:
            return 0;
    }
}

// دوال حساب المجموع من البيانات المخزنة
function calculateParcelsTotalFromData(data) {
    const paymentType = data[`parcelPaymentType`];
    if (paymentType === 'cash') {
        const stampsAmount = parseFloat(data[`parcelStampsAmount`]) || 0;
        const parcelCount = parseFloat(data[`parcelCount`]) || 0;
        return stampsAmount + parcelCount;
    } else {
        const electronicStamps = parseFloat(data[`electronicParcelStamps`]) || 0;
        const electronicCount = parseFloat(data[`electronicParcelCount`]) || 0;
        return electronicStamps + electronicCount;
    }
}

function calculateStampsTotalFromData(data) {
    const paymentType = data[`stampPaymentType`];
    if (paymentType === 'cash') {
        const stampAmount = parseFloat(data[`stampAmount`]) || 0;
        const stampParcelCount = parseFloat(data[`stampParcelCount`]) || 0;
        return stampAmount + stampParcelCount;
    } else {
        const electronicStampAmount = parseFloat(data[`electronicStampAmount`]) || 0;
        const electronicStampParcelCount = parseFloat(data[`electronicStampParcelCount`]) || 0;
        return electronicStampAmount + electronicStampParcelCount;
    }
}

function calculateBoxesTotalFromData(data) {
    const paymentType = data[`boxPaymentType`];
    if (paymentType === 'cash') {
        const rentAmount = parseFloat(data[`boxRentAmount`]) || 0;
        const insuranceAmount = parseFloat(data[`boxInsuranceAmount`]) || 0;
        return rentAmount + insuranceAmount;
    } else {
        const electronicRent = parseFloat(data[`electronicBoxRentAmount`]) || 0;
        const electronicInsurance = parseFloat(data[`electronicBoxInsuranceAmount`]) || 0;
        return electronicRent + electronicInsurance;
    }
}

function calculateEnvelopesTotalFromData(data) {
    const paymentType = data[`envelopePaymentType`];
    if (paymentType === 'cash') {
        const envelopeCount = parseFloat(data[`envelopeCount`]) || 0;
        const envelopeTotalAmount = parseFloat(data[`envelopeTotalAmount`]) || 0;
        return envelopeCount + envelopeTotalAmount;
    } else {
        const electronicEnvelopeCount = parseFloat(data[`electronicEnvelopeCount`]) || 0;
        const electronicEnvelopeTotalAmount = parseFloat(data[`electronicEnvelopeTotalAmount`]) || 0;
        return electronicEnvelopeCount + electronicEnvelopeTotalAmount;
    }
}

function calculateRentTotalFromData(data) {
    return parseFloat(data[`rentAmount`]) || 0;
}

function calculateMiscTotalFromData(data) {
    return parseFloat(data[`miscAmount`]) || 0;
}

// دالة عرض الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);

    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // إخفاء الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// دالة تحميل البيانات
function loadRevenueData() {
    // يمكن تنفيذ هذه الدالة لتحميل البيانات من الخادم
    // في هذا المثال، نبدأ بمصفوفة فارغة
    revenueData = [];
    console.log('تم تهيئة مصفوفة البيانات الفارغة');
    updateRevenueTable();
}

// دوال تحرير وحذف الإدخالات
function editEntry(id) {
    const entry = revenueData.find(e => e.id === id);
    if (!entry) return;

    // إنشاء القائمة المنبثقة للتعديل
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    // إنشاء محتوى القائمة المنبثقة
    const modalContent = document.createElement('div');
    modalContent.className = 'edit-modal-content';
    
    // إنشاء رأس القائمة المنبثقة
    const modalHeader = document.createElement('div');
    modalHeader.className = 'edit-modal-header';
    modalHeader.innerHTML = `
        <h3>تعديل البيانات</h3>
        <button class="edit-modal-close" onclick="closeEditModal()">×</button>
    `;
    
    // إنشاء نموذج التعديل
    const editForm = document.createElement('form');
    editForm.className = 'edit-form';
    editForm.id = 'editForm';
    
    // إضافة الحقول حسب نوع القسم
    const fields = getFieldsForSection(entry.type);
    fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'edit-form-group';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        
        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                input.appendChild(optionElement);
            });
            
            // إضافة معالج حدث لتغيير وسيلة الدفع
            input.addEventListener('change', function() {
                const paymentType = this.value;
                const formGroups = editForm.querySelectorAll('.edit-form-group');
                
                formGroups.forEach(group => {
                    const input = group.querySelector('input, select');
                    if (!input) return;
                    
                    const fieldName = input.name;
                    const label = group.querySelector('label');
                    
                    // تحديث الحقول بناءً على نوع الدفع
                    if (paymentType === 'electronic') {
                        if (fieldName.includes('Amount')) {
                            input.name = `${fieldName}Electronic`;
                            label.textContent = `${label.textContent} إلكتروني`;
                        }
                        if (fieldName.includes('Count')) {
                            input.name = `${fieldName}Electronic`;
                            label.textContent = `${label.textContent} إلكتروني`;
                        }
                    } else {
                        if (fieldName.endsWith('Electronic')) {
                            input.name = fieldName.replace('Electronic', '');
                            label.textContent = label.textContent.replace(' إلكتروني', '');
                        }
                    }
                });
            });
        } else {
            input = document.createElement('input');
            input.type = field.type;
        }
        
        input.name = field.name;
        input.value = entry.data[field.name] || '';
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        editForm.appendChild(formGroup);
    });
    
    // إنشاء أزرار الإجراءات
    const formActions = document.createElement('div');
    formActions.className = 'edit-form-actions';
    formActions.innerHTML = `
        <button type="button" class="btn-cancel" onclick="closeEditModal()">إلغاء</button>
        <button type="button" class="btn-save" id="saveEditButton">حفظ التغييرات</button>
    `;
    
    // تجميع القائمة المنبثقة
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(editForm);
    modalContent.appendChild(formActions);
    modal.appendChild(modalContent);
    
    // إضافة القائمة المنبثقة إلى الصفحة
    document.body.appendChild(modal);
    
    // إظهار القائمة المنبثقة
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // إضافة معالج حدث لزر حفظ التغييرات
    const saveButton = document.getElementById('saveEditButton');
    saveButton.addEventListener('click', function() {
        console.log('تم النقر على زر حفظ التغييرات');
        
        const formData = new FormData(editForm);
        const updatedData = {};
        
        for (let [key, value] of formData.entries()) {
            updatedData[key] = value;
            console.log(`حقل: ${key}, قيمة: ${value}`);
        }
        
        // تحديث البيانات
        entry.data = { ...entry.data, ...updatedData };
        // تحديث تاريخ التعديل
        entry.lastModified = new Date().toISOString();
        console.log('البيانات المحدثة:', entry.data);
        
        // تحديث الجدول
        updateRevenueTable();
        
        // إغلاق القائمة المنبثقة
        closeEditModal();
        
        // عرض رسالة نجاح
        showNotification('تم تحديث البيانات بنجاح', 'success');
    });
}

// دالة إغلاق القائمة المنبثقة للتعديل
function closeEditModal() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// دالة مساعدة للحصول على الحقول حسب القسم
function getFieldsForSection(section) {
    const fields = {
        parcels: [
            { name: 'parcelPaymentType', label: 'وسيلة الدفع', type: 'select', options: [
                { value: 'cash', text: 'نقدي' },
                { value: 'electronic', text: 'إلكتروني' }
            ]},
            { name: 'parcelStampsAmount', label: 'مبلغ طوابع الطرود', type: 'number' },
            { name: 'parcelCount', label: 'الحزم والرزم', type: 'number' },
            { name: 'parcelReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'parcelCreationDate', label: 'التاريخ', type: 'date' }
        ],
        stamps: [
            { name: 'stampPaymentType', label: 'وسيلة الدفع', type: 'select', options: [
                { value: 'cash', text: 'نقدي' },
                { value: 'electronic', text: 'إلكتروني' }
            ]},
            { name: 'stampAmount', label: 'مبلغ الطوابع', type: 'number' },
            { name: 'stampReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'stampCreationDate', label: 'التاريخ', type: 'date' }
        ],
        boxes: [
            { name: 'boxPaymentType', label: 'وسيلة الدفع', type: 'select', options: [
                { value: 'cash', text: 'نقدي' },
                { value: 'electronic', text: 'إلكتروني' }
            ]},
            { name: 'boxRentAmount', label: 'مبلغ الإيجار', type: 'number' },
            { name: 'boxInsuranceAmount', label: 'مبلغ التأمين', type: 'number' },
            { name: 'boxReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'boxCreationDate', label: 'التاريخ', type: 'date' }
        ],
        envelopes: [
            { name: 'envelopePaymentType', label: 'وسيلة الدفع', type: 'select', options: [
                { value: 'cash', text: 'نقدي' },
                { value: 'electronic', text: 'إلكتروني' }
            ]},
            { name: 'envelopeTotalAmount', label: 'المبلغ الإجمالي', type: 'number' },
            { name: 'envelopeReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'envelopeCreationDate', label: 'التاريخ', type: 'date' }
        ],
        rent: [
            { name: 'rentAmount', label: 'مبلغ الإيجار', type: 'number' },
            { name: 'rentReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'rentCreationDate', label: 'التاريخ', type: 'date' }
        ],
        misc: [
            { name: 'miscAmount', label: 'المبلغ', type: 'number' },
            { name: 'miscReceiptNumber', label: 'رقم الوصل', type: 'text' },
            { name: 'miscCreationDate', label: 'التاريخ', type: 'date' },
            { name: 'miscDescription', label: 'الوصف', type: 'text' }
        ]
    };
    
    return fields[section] || [];
}

function deleteEntry(id) {
    // إنشاء عنصر القائمة المنبثقة
    const modal = document.createElement('div');
    modal.className = 'delete-confirm-modal';
    modal.innerHTML = `
        <div class="delete-confirm-content">
            <i class="fas fa-trash-alt"></i>
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف هذا الإدخال؟</p>
            <div class="delete-confirm-buttons">
                <button class="btn-cancel" onclick="closeDeleteModal()">إلغاء</button>
                <button class="btn-delete" onclick="confirmDelete(${id})">حذف</button>
            </div>
        </div>
    `;

    // إضافة القائمة المنبثقة إلى الصفحة
    document.body.appendChild(modal);

    // إظهار القائمة المنبثقة
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// دالة إغلاق القائمة المنبثقة
function closeDeleteModal() {
    const modal = document.querySelector('.delete-confirm-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// دالة تأكيد الحذف
function confirmDelete(id) {
        revenueData = revenueData.filter(entry => entry.id !== id);
        updateRevenueTable();
        showNotification('تم حذف البيانات بنجاح', 'success');
    closeDeleteModal();
} 