console.log('PostalOffice.js loaded');

// دالة تهيئة الصفحة
function initPostalOffice() {
    console.log('تهيئة صفحة المكاتب البريدية');
    
    // جمع جميع الصفوف الموجودة
    allRows = Array.from(document.querySelectorAll('tbody tr'));
    
    // تحميل الأقسام من localStorage أو استخدام الأقسام الافتراضية
    const savedSections = localStorage.getItem('sections');
    if (savedSections) {
        sections = JSON.parse(savedSections);
    } else {
        sections = defaultSections;
        localStorage.setItem('sections', JSON.stringify(sections));
    }
    
    updateSectionsList();
    updateTable();
}

let currentPage = 1;
const rowsPerPage = 25;
let allRows = [];
let sections = []; // إضافة مصفوفة لتخزين الأقسام

// متغير لتخزين معرف المكتب البريدي المراد حذفه
let officeToDelete = null;

// تعريف الأقسام الافتراضية لمحافظات العراق
const defaultSections = [
    { id: 1, name: 'قسم بريد بغداد', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 2, name: 'قسم بريد ديالى', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 3, name: 'قسم بريد الناصرية', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 4, name: 'قسم بريد البصرة', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 5, name: 'قسم بريد الموصل', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 6, name: 'قسم بريد كركوك', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 10, name: 'قسم بريد كربلاء', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 11, name: 'قسم بريد النجف', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 12, name: 'قسم بريد المثنى', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 13, name: 'قسم بريد القادسية', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 14, name: 'قسم بريد ميسان', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 15, name: 'قسم بريد ذي قار', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 16, name: 'قسم بريد واسط', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 18, name: 'قسم بريد صلاح الدين', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' },
    { id: 19, name: 'قسم بريد الأنبار', status: 'فعال', addDate: new Date().toISOString(), editDate: '-' }
];

// تحديث الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إذا تم تحميل الصفحة مباشرة (وليس من خلال main.js)
    if (document.getElementById('officesTableBody')) {
        initPostalOffice();
    }
});

function updateTable() {
    const tbody = document.getElementById('officesTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // التحقق من وجود بيانات
    if (allRows.length === 0) {
        tbody.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedRows = allRows.slice(start, end);
    
    tbody.innerHTML = paginatedRows.map((row, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${row.cells[1].textContent}</td>
            <td>${row.cells[2].textContent}</td>
            <td>
                <span class="status-badge ${row.cells[3].textContent === 'فعال' ? 'active' : 'inactive'}">
                    ${row.cells[3].textContent}
                </span>
            </td>
            <td>${row.cells[4].textContent}</td>
            <td>${row.cells[5].textContent}</td>
            <td>
                <div class="action-buttons">
                    <i class="fas fa-edit" onclick="showEditModal(this.closest('tr'))" style="cursor: pointer; margin-right: 20px; color: #007bff;"></i>
                    <i class="fas fa-trash" onclick="deleteOffice(this.closest('tr'))" style="cursor: pointer; margin-right: 10px; color: #dc3545;"></i>
                </div>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allRows.length / rowsPerPage);
    const paginationContainer = document.querySelector('.pagination') || createPaginationContainer();
    
    paginationContainer.innerHTML = `
        <button class="nav-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
        </button>
        <button class="nav-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <span class="page-info">صفحة ${currentPage} من ${totalPages}</span>
        <button class="nav-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
        <button class="nav-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
        </button>
    `;
}

// إضافة أنماط CSS لأزرار التصفح
const paginationStyles = document.createElement('style');
paginationStyles.textContent = `
    .nav-btn {
        background: #fff;
        border: 1px solid #ddd;
        padding: 8px 12px;
        margin: 0 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .nav-btn:hover:not(:disabled) {
        background: #f0f0f0;
        border-color: #999;
    }

    .nav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-info {
        margin: 0 10px;
        color: #666;
    }
`;
document.head.appendChild(paginationStyles);

// إنشاء حاوية أزرار التصفح
function createPaginationContainer() {
    const container = document.querySelector('.container');
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    container.appendChild(pagination);
    return pagination;
}

function changePage(page) {
    const totalPages = Math.ceil(allRows.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateTable();
    }
}

function toggleActions(button) {
    event.stopPropagation();
    const content = button.nextElementSibling;
    content.classList.toggle('show');
}

function showEditModal(row) {
    updateSectionsList();
    const officeName = row.cells[1].textContent;
    const sectionName = row.cells[2].textContent;
    const status = row.cells[3].textContent;
    
    // تعيين القيم في النموذج
    const officeNameInput = document.getElementById('officeName');
    const sectionNameInput = document.getElementById('sectionName');
    const statusSelect = document.getElementById('status');
    
    officeNameInput.value = officeName;
    officeNameInput.defaultValue = officeName;
    
    sectionNameInput.value = sectionName;
    sectionNameInput.defaultValue = sectionName;
    
    statusSelect.value = status === 'فعال' ? 'active' : 'inactive';
    
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
}

// دالة لعرض رسائل التنبيه
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    // إضافة الأنماط CSS للرسالة المنبثقة
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            min-width: 300px;
            text-align: center;
        }
        .notification.error {
            border-bottom: 4px solid #dc3545;
        }
        .notification.success {
            border-bottom: 4px solid #28a745;
        }
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .notification i {
            font-size: 20px;
        }
        .notification.error i {
            color: #dc3545;
        }
        .notification.success i {
            color: #28a745;
        }
        @keyframes slideIn {
            from { transform: translate(-50%, 100%); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translate(-50%, 0); opacity: 1; }
            to { transform: translate(-50%, 100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // إزالة الرسالة بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newOfficeName = document.getElementById('officeName').value;
    const newSectionName = document.getElementById('sectionName').value;
    const newStatus = document.getElementById('status').value;
    const originalOfficeName = document.getElementById('officeName').defaultValue;
    const originalSectionName = document.getElementById('sectionName').defaultValue;
    
    // التحقق من وجود القسم الجديد
    const section = sections.find(s => s.name === newSectionName);
    if (!section) {
        showNotification('القسم غير موجود', 'error');
        return;
    }
    
    // تحديث الصف في مصفوفة الصفوف
    allRows.forEach(row => {
        if (row.cells[1].textContent === originalOfficeName && row.cells[2].textContent === originalSectionName) {
            row.cells[1].textContent = newOfficeName;
            row.cells[2].textContent = newSectionName;
            const statusText = newStatus === 'active' ? 'فعال' : 'غير فعال';
            const statusClass = newStatus === 'active' ? 'status-active' : 'status-inactive';
            row.cells[3].innerHTML = `<span class="status-badge ${statusClass}">${statusText}</span>`;
            row.cells[5].textContent = new Date().toISOString().split('T')[0];
        }
    });
    
    // تحديث الجدول
    updateTable();
    closeEditModal();
    showNotification('تم تحديث المكتب البريدي بنجاح', 'success');
});

function showAddModal() {
    updateSectionsList();
    document.getElementById('addModal').style.display = 'block';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('addForm').reset();
}

// دالة لتحديث أرقام التسلسل
function updateRowNumbers() {
    allRows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

// تعديل دالة إضافة مكتب جديد
document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newOfficeName = document.getElementById('newOfficeName').value;
    const newSectionName = document.getElementById('newSectionName').value;
    const newStatus = document.getElementById('newStatus').value;
    const currentDate = new Date().toISOString().split('T')[0];
    
    // التحقق من وجود القسم
    const section = sections.find(s => s.name === newSectionName);
    if (!section) {
        showNotification('القسم غير موجود', 'error');
        return;
    }
    
    // إنشاء صف جديد
    const newRow = document.createElement('tr');
    const statusClass = newStatus === 'active' ? 'status-active' : 'status-inactive';
    
    newRow.innerHTML = `
        <td>${allRows.length + 1}</td>
        <td>${newOfficeName}</td>
        <td>${newSectionName}</td>
        <td><span class="status-badge ${statusClass}">${newStatus === 'active' ? 'فعال' : 'غير فعال'}</span></td>
        <td>${currentDate}</td>
        <td>-</td>
        <td>
            <div class="action-buttons">
                <i class="fas fa-edit" onclick="showEditModal(this.closest('tr'))" style="cursor: pointer; margin-right: 20px; color: #007bff;"></i>
                <i class="fas fa-trash" onclick="deleteOffice(this.closest('tr'))" style="cursor: pointer; margin-right: 10px; color: #dc3545;"></i>
            </div>
        </td>
    `;
    
    // إضافة الصف الجديد إلى مصفوفة الصفوف
    allRows.push(newRow);
    
    // تحديث أرقام التسلسل
    updateRowNumbers();
    
    // تحديث الجدول
    updateTable();
    closeAddModal();
    document.getElementById('addForm').reset();
    
    // عرض رسالة نجاح
    showNotification('تم إضافة المكتب البريدي بنجاح', 'success');
});

// دالة لتحديث قائمة الأقسام في النماذج
function updateSectionsList() {
    const editSelect = document.getElementById('sectionName');
    const addSelect = document.getElementById('newSectionName');
    
    // تحديث قائمة الأقسام في نموذج التعديل
    editSelect.innerHTML = '<option value="">اختر القسم</option>';
    sections.forEach(section => {
        if (section.status === 'فعال') {
            editSelect.innerHTML += `<option value="${section.name}">${section.name}</option>`;
        }
    });
    
    // تحديث قائمة الأقسام في نموذج الإضافة
    addSelect.innerHTML = '<option value="">اختر القسم</option>';
    sections.forEach(section => {
        if (section.status === 'فعال') {
            addSelect.innerHTML += `<option value="${section.name}">${section.name}</option>`;
        }
    });
}

// دالة لتفريغ البيانات من الجدول
function clearTable() {
    if (confirm('هل أنت متأكد من تفريغ جميع البيانات من الجدول؟')) {
        // تفريغ مصفوفة الصفوف
        allRows = [];
        
        // تحديث الجدول
        updateTable();
        
        // عرض رسالة نجاح
        showNotification('تم تفريغ البيانات بنجاح', 'success');
    }
}

// دالة عرض نافذة تأكيد الحذف
function showDeleteConfirmModal(officeName) {
    officeToDelete = officeName;
    document.getElementById('officeToDeleteName').textContent = officeName;
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'block';
}

// دالة إغلاق نافذة تأكيد الحذف
function closeDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
    officeToDelete = null;
}

// دالة حذف المكتب البريدي
function deleteOffice(row) {
    const officeName = row.cells[1].textContent;
    showDeleteConfirmModal(officeName);
}

// دالة تأكيد الحذف
function confirmDelete() {
    if (officeToDelete) {
        // البحث عن الصف المراد حذفه
        const rowToDelete = allRows.find(row => row.cells[1].textContent === officeToDelete);
        
        if (rowToDelete) {
            // حذف الصف من مصفوفة الصفوف
            const index = allRows.indexOf(rowToDelete);
            allRows.splice(index, 1);
            
            // تحديث أرقام التسلسل
            updateRowNumbers();
            
            // تحديث الجدول
            updateTable();
            
            // إغلاق النافذة المنبثقة
            closeDeleteModal();
            
            // عرض رسالة نجاح
            showNotification('تم حذف المكتب البريدي بنجاح', 'success');
        }
    }
}