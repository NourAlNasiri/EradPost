console.log('PostalDepartment.js loaded');

// متغيرات عامة لتخزين البيانات وإدارة الحالة
let sections = []; // تخزين قائمة الأقسام
let currentId = 1; // معرف فريد للأقسام الجديدة
let currentPage = 1; // الصفحة الحالية في التقسيم
const rowsPerPage = 25; // عدد الصفوف في كل صفحة
let editingSectionId = null; // معرف القسم قيد التعديل
let rowToEdit = null; // الصف قيد التعديل
let departmentToDelete = null; // القسم المراد حذفه

// فتح نافذة منبثقة لإضافة أو تعديل قسم
function openModal() {
    document.getElementById('sectionModal').style.display = 'block';
    if (!editingSectionId) {
        document.querySelector('.modal-content h2').innerHTML = '<i class="fas fa-plus-circle"></i> إضافة قسم جديد';
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
    return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        calendar: 'gregory'
    });
}

// حفظ القسم الجديد أو تعديل القسم الموجود
function saveSection() {
    const name = document.getElementById('sectionName').value;
    const status = document.getElementById('sectionStatus').value;
    const currentDate = new Date().toISOString();

    if (!name) {
        showNotification('الرجاء إدخال اسم القسم', 'error');
        return;
    }

    if (editingSectionId) {
        // تعديل قسم موجود
        const sectionIndex = sections.findIndex(s => s.id === editingSectionId);
        if (sectionIndex !== -1) {
            sections[sectionIndex] = {
                ...sections[sectionIndex],
                name,
                status,
                editDate: currentDate
            };
            showNotification('تم تعديل القسم بنجاح', 'success');
        }
    } else {
        // إضافة قسم جديد
        sections.push({
            id: currentId++,
            name,
            status,
            addDate: currentDate,
            editDate: '-'
        });
        showNotification('تم إضافة القسم بنجاح', 'success');
    }

    updateTable();
    closeModal();
    resetForm();
}

// إعادة تعيين نموذج الإضافة/التعديل
function resetForm() {
    document.getElementById('sectionName').value = '';
    document.getElementById('sectionStatus').value = 'فعال';
}

// تحديث جدول عرض الأقسام
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
                    <i class="fas fa-edit" onclick="editSection(${section.id})" style="cursor: pointer; margin-right: 20px; color: #2196F3;"></i>
                    <i class="fas fa-trash" onclick="deleteSection(${section.id})" style="cursor: pointer; margin-right: 10px; color: #f44336;"></i>
                </div>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

// تحديث أزرار التصفح بين الصفحات
function updatePagination() {
    const totalPages = Math.ceil(sections.length / rowsPerPage);
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

// تغيير الصفحة الحالية
function changePage(page) {
    const totalPages = Math.ceil(sections.length / rowsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateTable();
    }
}

// البحث في الأقسام
function searchSection() {
    const searchText = document.querySelector('.search-input').value.toLowerCase();
    const filteredSections = sections.filter(section => 
        section.name.toLowerCase().includes(searchText)
    );
    updateTableWithFilteredData(filteredSections);
}

// تحديث الجدول بالبيانات المفلترة
function updateTableWithFilteredData(filteredSections) {
    const tbody = document.getElementById('sectionsTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedFilteredSections = filteredSections.slice(startIndex, endIndex);

    paginatedFilteredSections.forEach(section => {
        const row = createTableRow(section);
        tbody.appendChild(row);
    });

    updatePagination();
}

// تعديل قسم موجود
function editSection(id) {
    const section = sections.find(s => s.id === id);
    if (section) {
        document.getElementById('sectionName').value = section.name;
        document.getElementById('sectionStatus').value = section.status;
        editingSectionId = id;
        document.querySelector('.modal-content h2').innerHTML = '<i class="fas fa-edit"></i> تعديل القسم';
        openModal();
    }
}

// حذف قسم
function deleteSection(id) {
    const section = sections.find(s => s.id === id);
    if (section) {
        departmentToDelete = section;
        document.getElementById('departmentToDeleteName').textContent = section.name;
        document.getElementById('deleteConfirmModal').style.display = 'block';
    }
}

// إغلاق نافذة تأكيد الحذف
function closeDeleteModal() {
    document.getElementById('deleteConfirmModal').style.display = 'none';
    departmentToDelete = null;
}

// تأكيد حذف القسم
function confirmDelete() {
    if (departmentToDelete) {
        sections = sections.filter(section => section.id !== departmentToDelete.id);
        updateTable();
        showNotification('تم حذف القسم بنجاح', 'success');
        closeDeleteModal();
    }
}

// عرض إشعار للمستخدم
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

// معالجة النقر خارج النوافذ المنبثقة
window.onclick = event => {
    if (event.target.className === 'modal') {
        closeModal();
    }
    if (event.target.id === 'deleteConfirmModal') {
        closeDeleteModal();
    }
};

// إغلاق قوائم الإجراءات عند النقر خارجها
document.addEventListener('click', event => {
    if (!event.target.closest('.actions-dropdown')) {
        document.querySelectorAll('.actions-content').forEach(content => {
            content.classList.remove('show');
        });
    }
});

// تهيئة الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateTable();
});

// دالة تهيئة الصفحة - يتم استدعاؤها من main.js
function initPostalDepartment() {
    console.log('تم تهيئة صفحة الأقسام البريدية');
    // تحديث الجدول عند تحميل الصفحة
    updateTable();
    
    // إضافة مستمعي الأحداث للبحث
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', searchSection);
    }
    
    // إضافة مستمعي الأحداث لأزرار التصفح
    const paginationButtons = document.querySelectorAll('.pagination button');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                const pageNumber = this.textContent.trim();
                if (pageNumber !== '') {
                    changePage(parseInt(pageNumber));
                } else if (this.querySelector('.fa-chevron-right')) {
                    changePage(currentPage - 1);
                } else if (this.querySelector('.fa-chevron-left')) {
                    changePage(currentPage + 1);
                }
            }
        });
    });
} 