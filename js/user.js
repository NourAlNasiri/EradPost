console.log('user.js loaded');

// مصفوفة لتخزين بيانات المستخدمين
let users = [];
let userToDelete = null;

// إضافة متغيرات للتحكم بالصفحات
let currentPage = 1;
const itemsPerPage = 25;

function showAddUserModal() {
    const modal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const passwordHint = document.querySelector('.password-hint');
    
    modalTitle.textContent = 'إضافة مستخدم جديد';
    userForm.reset();
    passwordHint.style.display = 'none';
    document.getElementById('password').required = true;
    document.getElementById('password').placeholder = 'كلمة المرور';
    modal.classList.add('show');
    
    // فتح قسم المعلومات الأساسية تلقائياً
    setTimeout(() => {
        toggleAccordion('basicInfo');
    }, 100);
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    const passwordHint = document.querySelector('.password-hint');
    modal.classList.remove('show');
    document.getElementById('userForm').reset();
    passwordHint.style.display = 'none';
    delete document.getElementById('userForm').dataset.userId;
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        document.getElementById('modalTitle').textContent = 'تعديل بيانات المستخدم';
        document.getElementById('fullName').value = user.fullName;
        document.getElementById('username').value = user.username;
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('role').value = user.role;
        document.getElementById('office').value = user.office;
        document.getElementById('governorate').value = user.governorate;
        document.getElementById('status').value = user.status;
        
        // تعطيل حقل كلمة المرور وجعله اختيارياً عند التعديل
        const passwordInput = document.getElementById('password');
        const passwordHint = document.querySelector('.password-hint');
        passwordInput.required = false;
        passwordInput.placeholder = 'اتركه فارغاً إذا لم ترد تغيير كلمة المرور';
        passwordHint.style.display = 'block';
        
        document.getElementById('userForm').dataset.userId = userId;
        document.getElementById('userModal').classList.add('show');
    }
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        userToDelete = userId;
        document.getElementById('deleteUserName').textContent = user.fullName;
        document.getElementById('deleteConfirmModal').classList.add('show');
    }
}

function showDeleteConfirmModal(userId, userName) {
    const modal = document.getElementById('deleteConfirmModal');
    const userNameElement = document.getElementById('deleteUserName');
    
    userNameElement.textContent = userName;
    modal.classList.add('show');
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.classList.remove('show');
    userToDelete = null;
}

function confirmDelete() {
    if (userToDelete) {
        users = users.filter(user => user.id !== userToDelete);
        updateUsersTable();
        closeDeleteConfirmModal();
        showNotification(
            'تم الحذف بنجاح',
            'تم حذف المستخدم بنجاح',
            'success'
        );
    }
}

// تحويل رمز الدور إلى اسمه
function getRoleName(role) {
    const roles = {
        'office_staff': 'موظف مكتب',
        'supervisor': 'مشرف قسم',
        'admin': 'مدير نظام'
    };
    return roles[role] || role;
}

// تحويل رمز المحافظة إلى اسمها
function getGovernorateName(governorate) {
    const governorates = {
        'baghdad': 'بغداد',
        'basra': 'البصرة',
        'mosul': 'الموصل',
        'kirkuk': 'كركوك',
        'karbala': 'كربلاء',
        'najaf': 'النجف',
        'kut': 'الكوت',
        'amara': 'العمارة',
        'nasiriyah': 'الناصرية',
        'samawa': 'السماوة',
        'diwaniyah': 'الديوانية',
        'ramadi': 'الرمادي',
        'fallujah': 'الفلوجة'
    };
    return governorates[governorate] || governorate;
}

// تحويل رمز الحالة إلى اسمها
function getStatusName(status) {
    return status === 'active' ? 'نشط' : 'غير نشط';
}

function searchUsers() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.fullName.toLowerCase().includes(searchText) ||
        user.username.toLowerCase().includes(searchText) ||
        (user.phone && user.phone.includes(searchText))
    );
    currentPage = 1; // إعادة تعيين الصفحة الحالية عند البحث
    updateUsersTable(filteredUsers);
}

function showUserDetails(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        document.getElementById('detailFullName').textContent = user.fullName;
        document.getElementById('detailUsername').textContent = user.username;
        document.getElementById('detailPhone').textContent = user.phone || 'غير متوفر';
        document.getElementById('detailRole').textContent = getRoleName(user.role);
        document.getElementById('detailOffice').textContent = user.office || 'غير محدد';
        document.getElementById('detailGovernorate').textContent = getGovernorateName(user.governorate);
        
        const statusElement = document.getElementById('detailStatus');
        statusElement.textContent = getStatusName(user.status);
        statusElement.className = `user-status ${user.status}`;
        
        document.getElementById('userDetailsModal').classList.add('show');
    }
}

function showUserDetailsModal(user) {
    const modal = document.getElementById('userDetailsModal');
    
    // تعبئة بيانات المستخدم في النافذة المنبثقة
    document.getElementById('detailFullName').textContent = user.fullName;
    document.getElementById('detailUsername').textContent = user.username;
    document.getElementById('detailPhone').textContent = user.phone;
    document.getElementById('detailRole').textContent = user.role;
    document.getElementById('detailOffice').textContent = user.office;
    document.getElementById('detailGovernorate').textContent = user.governorate;
    
    const statusElement = document.getElementById('detailStatus');
    statusElement.textContent = user.status === 'active' ? 'نشط' : 'غير نشط';
    statusElement.className = `user-status ${user.status}`;
    
    modal.classList.add('show');
}

function closeUserDetailsModal() {
    const modal = document.getElementById('userDetailsModal');
    modal.classList.remove('show');
}

// تحديث جدول المستخدمين
function updateUsersTable(usersToShow = users) {
    const tbody = document.getElementById('usersTable');
    const noDataMessage = document.getElementById('noDataMessage');
    tbody.innerHTML = '';

    // التحكم في ظهور رسالة "لا توجد بيانات"
    if (usersToShow.length === 0) {
        noDataMessage.style.display = 'block';
    } else {
        noDataMessage.style.display = 'none';
    }

    // حساب بداية ونهاية الصفحة الحالية
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // ترتيب المستخدمين بحيث يظهر المستخدمون الجدد في النهاية
    const sortedUsers = [...usersToShow].sort((a, b) => a.id - b.id);
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    // إنشاء صفوف الجدول
    paginatedUsers.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.style.animation = `fadeIn 0.5s ease ${index * 0.1}s`;
        tr.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.8rem; cursor: pointer;" onclick="showUserDetails('${user.id}')">
                    <div style="width: 40px; height: 40px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        ${user.fullName.charAt(0)}
                    </div>
                    <span>${user.fullName}</span>
                </div>
            </td>
            <td>${user.username}</td>
            <td>
                ${user.phone ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-phone" style="color: #3498db;"></i>
                        <span>${user.phone}</span>
                    </div>
                ` : '-'}
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-user-shield" style="color: #3498db;"></i>
                    <span>${getRoleName(user.role)}</span>
                </div>
            </td>
            <td>${user.office || '-'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-map-marker-alt" style="color: #3498db;"></i>
                    <span>${getGovernorateName(user.governorate)}</span>
                </div>
            </td>
            <td>
                <span class="user-status ${user.status}">
                    <i class="fas ${user.status === 'active' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${getStatusName(user.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser('${user.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteUser('${user.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// دالة لعرض الإشعارات
function showNotification(title, message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.className = `notification ${type}`;
    notification.querySelector('.notification-title').textContent = title;
    notification.querySelector('.notification-message').textContent = message;
    notification.classList.add('show');

    // إضافة الأيقونة المناسبة
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="hideNotification()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // إخفاء الإشعار تلقائياً بعد 5 ثواني
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// دالة لإخفاء الإشعارات
function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

// تحديث معالج إرسال النموذج
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        id: this.dataset.userId || Date.now().toString(),
        fullName: document.getElementById('fullName').value,
        username: document.getElementById('username').value,
        phone: document.getElementById('phone').value.trim() || null,
        role: document.getElementById('role').value,
        office: document.getElementById('office').value,
        governorate: document.getElementById('governorate').value,
        status: document.getElementById('status').value
    };

    try {
        if (this.dataset.userId) {
            // تحديث مستخدم موجود
            const index = users.findIndex(u => u.id === this.dataset.userId);
            if (index !== -1) {
                // الحفاظ على كلمة المرور القديمة إذا لم يتم تغييرها
                const oldUser = users[index];
                const newPassword = document.getElementById('password').value;
                formData.password = newPassword || oldUser.password;
                
                users[index] = formData;
                showNotification(
                    'تم التحديث بنجاح',
                    'تم تحديث بيانات المستخدم بنجاح',
                    'success'
                );
            }
        } else {
            // إضافة مستخدم جديد
            formData.password = document.getElementById('password').value;
            users.push(formData);
            showNotification(
                'تم الإضافة بنجاح',
                'تم إضافة المستخدم الجديد بنجاح',
                'success'
            );
        }

        updateUsersTable();
        closeUserModal();
        this.reset();
        delete this.dataset.userId;
        
        // إعادة تفعيل حقل كلمة المرور كحقل إلزامي
        document.getElementById('password').required = true;
        document.getElementById('password').placeholder = 'كلمة المرور';
    } catch (error) {
        showNotification(
            'حدث خطأ',
            'حدث خطأ أثناء حفظ البيانات',
            'error'
        );
    }
});

// تحديث قائمة المستخدمين عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateUsersTable();
});

// إغلاق النوافذ المنبثقة عند النقر خارجها
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeUserModal();
    }
    if (event.target.classList.contains('user-details-modal')) {
        closeUserDetailsModal();
    }
    if (event.target.classList.contains('modal') && event.target.id === 'deleteConfirmModal') {
        closeDeleteConfirmModal();
    }
});

// منع إغلاق النافذة المنبثقة عند النقر داخلها
document.querySelectorAll('.modal-content, .user-details-content').forEach(element => {
    element.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});

// دالة التحكم في إظهار/إخفاء كلمة المرور
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

// دالة للتحكم في فتح وإغلاق الأقسام القابلة للطي
function toggleAccordion(sectionId) {
    const content = document.getElementById(sectionId);
    const header = content.previousElementSibling;
    
    // إغلاق جميع الأقسام الأخرى
    document.querySelectorAll('.accordion-content').forEach(section => {
        if (section.id !== sectionId) {
            section.classList.remove('active');
            section.previousElementSibling.classList.remove('active');
        }
    });
    
    // تبديل حالة القسم المحدد
    content.classList.toggle('active');
    header.classList.toggle('active');
}

// دالة عرض المستخدمين في الجدول
function displayUsers(users) {
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    
    // ترتيب المستخدمين بحيث يظهر المستخدمون الجدد في النهاية
    users.sort((a, b) => a.id - b.id);
    
    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.fullName}</td>
            <td>${user.username}</td>
            <td>${user.phone || '-'}</td>
            <td>${getRoleName(user.role)}</td>
            <td>${user.office || '-'}</td>
            <td>${getGovernorateName(user.governorate)}</td>
            <td>
                <span class="user-status ${user.status === 'active' ? 'active' : 'inactive'}">
                    <i class="fas fa-${user.status === 'active' ? 'check-circle' : 'times-circle'}"></i>
                    ${user.status === 'active' ? 'مفعل' : 'معطل'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="showUserDetails(${user.id})" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" onclick="editUser(${user.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="showDeleteConfirm(${user.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // إظهار/إخفاء رسالة عدم وجود بيانات
    const noDataMessage = document.getElementById('noDataMessage');
    noDataMessage.style.display = users.length === 0 ? 'block' : 'none';
} 