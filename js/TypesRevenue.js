// دالة التهيئة للصفحة
function initTypesRevenue() {
    console.log('TypesRevenue.js loaded');
    // تحديث الجدول عند تحميل الصفحة
    updateTable();
}

let sections = []; // مصفوفة لتخزين أنواع الإيرادات
let currentId = 1; // معرف فريد لكل نوع إيراد
let currentPage = 1; // الصفحة الحالية في التقسيم
const rowsPerPage = 25; // عدد الصفوف في كل صفحة
let editingSectionId = null; // معرف نوع الإيراد قيد التعديل
let sectionToDelete = null; // نوع الإيراد المحدد للحذف

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // إضافة الأنماط CSS لرسالة "لا توجد بيانات"
    const style = document.createElement('style');
    style.textContent = `
        .no-data-message {
            display: none;
            text-align: center;
            padding: 30px;
            margin-top: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .no-data-message i {
            font-size: 48px;
            color: #ccc;
            margin-bottom: 15px;
            display: block;
        }
        
        .no-data-message h3 {
            color: #666;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .no-data-message p {
            color: #999;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
    
    // تحديث الجدول عند تحميل الصفحة
    updateTable();
});

// فتح نافذة منبثقة لإضافة أو تعديل نوع إيراد
function openModal() {
    document.getElementById('sectionModal').style.display = 'block';
    if (!editingSectionId) {
        document.querySelector('.modal-content h2').innerHTML = '<i class="fas fa-plus-circle"></i> إضافة نوع ايراد جديد';
        document.getElementById('sectionName').value = '';
        document.getElementById('sectionStatus').value = '';
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    document.getElementById('sectionModal').style.display = 'none';
    editingSectionId = null;
}

// تنسيق التاريخ لعرضه بالشكل المناسب
function formatDate(dateString) {
    if (dateString === '-') return '-';
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        calendar: 'gregory'
    };
    return date.toLocaleString('ar-SA', options);
}

// دالة لعرض رسالة منبثقة
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

// حفظ نوع الإيراد الجديد أو تعديل نوع موجود
function saveSection() {
    const name = document.getElementById('sectionName').value;
    const status = document.getElementById('sectionStatus').value;
    const currentDate = new Date().toISOString();

    if (!name) {
        showNotification('الرجاء إدخال نوع الايراد', 'error');
        return;
    }

    if (!status) {
        showNotification('الرجاء اختيار حالة نوع الايراد', 'error');
        return;
    }

    if (editingSectionId) {
        // تعديل نوع إيراد موجود
        const sectionIndex = sections.findIndex(s => s.id === editingSectionId);
        if (sectionIndex !== -1) {
            sections[sectionIndex] = {
                ...sections[sectionIndex],
                name: name,
                status: status,
                editDate: currentDate
            };
            showNotification('تم تعديل نوع الايراد بنجاح', 'success');
        }
    } else {
        // إضافة نوع إيراد جديد
        const newSection = {
            id: currentId++,
            name: name,
            status: status,
            addDate: currentDate,
            editDate: '-'
        };
        sections.push(newSection);
        showNotification('تم إضافة نوع الايراد بنجاح', 'success');
    }

    updateTable();
    closeModal();
    document.getElementById('sectionName').value = '';
    document.getElementById('sectionStatus').value = 'فعال';
}

// تحديث جدول عرض أنواع الإيرادات
function updateTable() {
    const tbody = document.getElementById('sectionsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    
    // التحقق من وجود بيانات
    if (sections.length === 0) {
        tbody.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedSections = sections.slice(start, end);
    
    tbody.innerHTML = paginatedSections.map((section, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${section.name}</td>
            <td>
                <span class="status-badge ${section.status === 'فعال' ? 'active' : 'inactive'}">
                    ${section.status}
                </span>
            </td>
            <td>${formatDate(section.addDate)}</td>
            <td>${formatDate(section.editDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editSection(${section.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteSection(${section.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

// تحديث أزرار التنقل بين الصفحات
function updatePagination() {
    const totalPages = Math.ceil(sections.length / rowsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    
    if (!paginationContainer) {
        const container = document.querySelector('.container');
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        container.appendChild(pagination);
    }

    paginationContainer.innerHTML = `
        <button onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
        </button>
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <span class="page-info">صفحة ${currentPage} من ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
        <button onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
        </button>
    `;
}

// تغيير الصفحة الحالية
function changePage(page) {
    const totalPages = Math.ceil(sections.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateTable();
    }
}

// تبديل عرض قائمة الإجراءات
function toggleActions(id, event) {
    event.preventDefault();
    event.stopPropagation();
    
    document.querySelectorAll('.actions-content').forEach(content => {
        content.classList.remove('show');
    });
    
    const actions = document.getElementById(`actions${id}`);
    if (actions) {
        actions.classList.add('show');
    }
}

// تعديل نوع إيراد محدد
function editSection(id) {
    const section = sections.find(s => s.id === id);
    if (section) {
        document.getElementById('sectionName').value = section.name;
        document.getElementById('sectionStatus').value = section.status;
        editingSectionId = id;
        document.querySelector('.modal-content h2').innerHTML = '<i class="fas fa-edit"></i> تعديل نوع الايراد';
        openModal();
    }
}

// البحث في أنواع الإيرادات
function searchSection() {
    const searchText = document.querySelector('.search-input').value.toLowerCase();
    const filteredSections = sections.filter(section => 
        section.name.toLowerCase().includes(searchText)
    );
    const tbody = document.getElementById('sectionsTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedFilteredSections = filteredSections.slice(startIndex, endIndex);

    paginatedFilteredSections.forEach(section => {
        const row = document.createElement('tr');
        const statusClass = section.status === 'فعال' ? 'status-active' : 'status-inactive';
        row.innerHTML = `
            <td>${section.id}</td>
            <td>${section.name}</td>
            <td><span class="status-badge ${statusClass}">${section.status}</span></td>
            <td>${formatDate(section.addDate)}</td>
            <td>${formatDate(section.editDate)}</td>
            <td>
                <button class="btn edit-btn" onclick="editSection(${section.id})" style="margin-left: 5px;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn delete-btn" onclick="deleteSection(${section.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    updatePagination();
}

// حذف نوع إيراد محدد
function deleteSection(id) {
    const section = sections.find(s => s.id === id);
    if (section) {
        sectionToDelete = section;
        document.getElementById('sectionToDeleteName').textContent = section.name;
        document.getElementById('deleteConfirmModal').style.display = 'block';
    }
}

// إغلاق نافذة تأكيد الحذف
function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    sectionToDelete = null;
}

// تأكيد حذف نوع الإيراد
function confirmDelete() {
    if (sectionToDelete) {
        sections = sections.filter(section => section.id !== sectionToDelete.id);
        updateTable();
        showNotification('تم حذف نوع الايراد بنجاح');
        closeDeleteModal();
    }
}

// إضافة أنماط CSS للعناصر
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translate(-50%, 100%); }
        to { transform: translate(-50%, 0); }
    }
    @keyframes slideOut {
        from { transform: translate(-50%, 0); }
        to { transform: translate(-50%, 100%); }
    }

    .action-buttons {
        display: flex;
        gap: 10px;
    }

    .action-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }

    .action-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: currentColor;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .action-btn:hover::before {
        opacity: 0.1;
    }

    .action-btn i {
        font-size: 16px;
        position: relative;
        z-index: 1;
    }

    .action-btn.edit {
        color: #2196F3;
        background: #E3F2FD;
    }

    .action-btn.delete {
        color: #f44336;
        background: #FFEBEE;
    }

    .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);

// معالجة النقر خارج النوافذ المنبثقة
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        closeModal();
    }
    if (event.target.id === 'deleteConfirmModal') {
        closeDeleteModal();
    }
}

// إغلاق قوائم الإجراءات عند النقر خارجها
document.addEventListener('click', function(event) {
    if (!event.target.closest('.actions-dropdown')) {
        document.querySelectorAll('.actions-content').forEach(content => {
            content.classList.remove('show');
        });
    }
});

// إغلاق قوائم الإجراءات عند النقر على زر
document.addEventListener('click', function(event) {
    if (event.target.closest('.actions-content button')) {
        const actionsContent = event.target.closest('.actions-content');
        if (actionsContent) {
            actionsContent.classList.remove('show');
        }
    }
});

// إغلاق قوائم الإجراءات عند النقر على زر القائمة المنسدلة
document.addEventListener('click', function(event) {
    if (event.target.closest('.actions-dropdown button')) {
        const button = event.target.closest('.actions-dropdown button');
        const dropdown = button.parentElement;
        const actionsContent = dropdown.querySelector('.actions-content');
        if (actionsContent) {
            actionsContent.classList.remove('show');
        }
    }
}); 