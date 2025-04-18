document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header");
    const contentContainer = document.getElementById("content");
    const footerContainer = document.getElementById("footer");

    // تحميل الهيدر أولاً
    fetch("Pages/header.html")
        .then(res => res.text())
        .then(data => {
            headerContainer.innerHTML = data;
            setupLinks();
        });

    // تحميل الفوتر
    fetch("Pages/footer.html")
        .then(res => res.text())
        .then(data => {
            footerContainer.innerHTML = data;
        })
        .catch(err => {
            console.error("فشل في تحميل الفوتر:", err);
        });

    function setupLinks() {
        const links = document.querySelectorAll("#header nav a");
        links.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const pageName = this.getAttribute("data-page");
                loadPage(pageName);
            });
        });
    }

    function loadPage(pageName) {
        fetch(`Pages/${pageName}.html`)
            .then(res => res.text())
            .then(data => {
                contentContainer.innerHTML = data;
                loadPageScript(pageName);
            })
            .catch(err => {
                contentContainer.innerHTML = `<p>فشل في تحميل الصفحة: ${pageName}</p>`;
            });
    }

    function loadPageScript(pageName) {
        // حذف السكربت السابق إذا موجود
        const oldScript = document.getElementById("page-script");
        if (oldScript) {
            oldScript.remove();
        }

        // تحويل اسم الصفحة إلى الحالة الصحيحة (أول حرف كبير)
        const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        
        // إنشاء عنصر السكربت الجديد
        const script = document.createElement("script");
        script.src = `js/${formattedPageName}.js`;
        script.id = "page-script";
        
        // إضافة معالجة الأخطاء
        script.onerror = (error) => {
            console.error(`فشل في تحميل ملف js/${formattedPageName}.js:`, error);
        };
        
        // إضافة معالجة نجاح التحميل
        script.onload = () => {
            console.log(`تم تحميل ملف js/${formattedPageName}.js بنجاح`);
            
            // تنفيذ دالة التهيئة إذا كانت موجودة
            const initFunctionName = `init${formattedPageName}`;
            if (typeof window[initFunctionName] === 'function') {
                console.log(`تنفيذ دالة ${initFunctionName}`);
                window[initFunctionName]();
            }
            
            // تنفيذ الدوال الموجودة في الملف مباشرة
            if (typeof window[`setup${formattedPageName}`] === 'function') {
                console.log(`تنفيذ دالة setup${formattedPageName}`);
                window[`setup${formattedPageName}`]();
            }
        };
        
        // إضافة السكربت إلى الصفحة
        document.body.appendChild(script);
    }

    // تحميل أول صفحة بشكل افتراضي
    loadPage("DashBoard");
});
