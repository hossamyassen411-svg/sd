const API_BASE = "https://hossameddin.tech/api/lessons";
let currentVideoUrl = "";

async function fetchVideo(lessonId) {
    const statusEl = document.getElementById('statusMessage');
    const videoContainer = document.getElementById('videoContainer');
    const actionButtons = document.getElementById('actionButtons');
    
    statusEl.innerText = `جاري جلب بيانات الدرس رقم ${lessonId}...`;
    videoContainer.innerHTML = '';
    actionButtons.style.display = 'none';

    try {
        // جلب الرابط من API
        const response = await fetch(`${API_BASE}/${lessonId}/video`, {
            headers: {
                'Accept': 'application/json',
                'Referer': 'https://hossameddin.tech/' // محاولة تخطي الحماية
            }
        });

        if (!response.ok) throw new Error(`السيرفر رفض الطلب: ${response.status}`);

        const data = await response.json();
        
        if (data && data.url) {
            currentVideoUrl = data.url;
            statusEl.innerText = `تم جلب الفيديو بنجاح!`;
            
            // حقن الفيديو في الصفحة
            const iframe = document.createElement('iframe');
            iframe.src = currentVideoUrl;
            iframe.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
            iframe.allowFullscreen = true;
            videoContainer.appendChild(iframe);

            actionButtons.style.display = 'flex';
            return true;
        } else {
            throw new Error("لم يتم العثور على رابط فيديو.");
        }

    } catch (error) {
        statusEl.innerText = `خطأ: ${error.message}`;
        console.error(error);
        return false;
    }
}

function fetchCurrentLesson() {
    const lessonId = document.getElementById('lessonId').value;
    fetchVideo(lessonId);
}

function downloadCurrentVideo() {
    if (!currentVideoUrl) return;
    
    // فتح الرابط في نافذة جديدة كمحاولة أولى للتحميل
    window.open(currentVideoUrl, '_blank');
    alert("تم فتح الرابط في نافذة جديدة. لو الفيديو محمي من التحميل المباشر، استخدم إضافة Video DownloadHelper في المتصفح.");
}

async function downloadAllLessons() {
    const statusEl = document.getElementById('statusMessage');
    statusEl.innerText = "جاري فحص الدروس من 1 إلى 50... (قد يستغرق وقتاً)";
    
    // هنا هنعمل لوب يجيب الروابط بس (مش هيحمل الفيديوهات، بس هيجيب الروابط)
    let links = "";
    for (let i = 1; i <= 50; i++) {
        try {
            const response = await fetch(`${API_BASE}/${i}/video`);
            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    links += `الدرس ${i}: ${data.url}\n`;
                    statusEl.innerText = `تم جلب الدرس ${i}...`;
                }
            }
        } catch (e) {
            console.log(`الدرس ${i} غير متاح`);
        }
    }

    // إنشاء ملف نصي فيه كل الروابط وتحميله
    const blob = new Blob([links], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'all_video_links.txt';
    a.click();
    
    statusEl.innerText = "تم تحميل ملف الروابط بنجاح!";
}