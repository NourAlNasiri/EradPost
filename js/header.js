console.log('header.js loaded');

document.addEventListener('DOMContentLoaded', function () {
    // تعريف المتغيرات الرئيسية
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');

    // متغيرات للتحكم في التمرير
    let lastScrollTop = 0;
    let scrollTimeout;

    // التحكم في ظهور واختفاء الهيدر عند التمرير
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // إظهار الهيدر في أعلى الصفحة
        if (currentScroll <= 50) {
            header.classList.remove('hide');
            header.classList.add('show');
            lastScrollTop = currentScroll;
            return;
        }

        // التحكم في الظهور والإخفاء حسب اتجاه التمرير
        if (currentScroll > lastScrollTop) {
            // عند التمرير للأسفل
            header.classList.add('hide');
            header.classList.remove('show');
        } else {
            // عند التمرير للأعلى
            header.classList.remove('hide');
            header.classList.add('show');
        }

        lastScrollTop = currentScroll;

        // إغلاق القائمة المنسدلة عند التمرير
        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        }

        // إخفاء الهيدر بعد التوقف عن التمرير
        scrollTimeout = setTimeout(() => {
            if (currentScroll > 50) {
                header.classList.add('hide');
                header.classList.remove('show');
            }
        }, 2000);
    });

    // التحكم في فتح وإغلاق القائمة المنسدلة
    menuToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // معالجة النقر على روابط القائمة
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            // إزالة التنشيط من جميع الروابط
            navLinks.forEach(l => l.classList.remove('active'));
            // تنشيط الرابط المختار
            this.classList.add('active');
            // إغلاق القائمة المنسدلة
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}); 