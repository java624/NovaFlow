// =========================================================================
// Конфігурація та Ініціалізація Supabase
// =========================================================================

const SUPABASE_URL = "https://vagrglarsxjtnsusyonv.supabase.co";
const SUPABASE_KEY = "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK";

const teacherSupabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseClient = teacherSupabase;

let selectedStudentId = null;  // Поточний обраний учень (ID)
let selectedStudentName = "";  // Ім'я обраного учня
let globalCalendar = null;     // Об'єкт календаря FullCalendar

// Глобальні змінні для Canvas перевірки вчителя
let tCanvas = null;
let tCtx = null;
let tIsDrawing = false;
let tCurrentTool = 'brush'; // 'brush', 'text' або 'eraser'
let tLastX = 0;
let tLastY = 0;
let tBgImage = new Image();

let currentReviewHomeworkId = null; // ID домашнього завдання, яке зараз перевіряється
let tUndoStack = []; // Історія змін для кроків назад
let tActiveTextarea = null; // Активне текстове поле на Canvas
let isFullscreenActive = false; // Стан повноекранного режиму дошки перевірки

// Головна подія старту програми
document.addEventListener("DOMContentLoaded", function() {
  verifyTeacherSession();
  initTeacherMenu();
  loadStudentsForTeacher();
  handleHomeworkPosting();
  initTeacherSaveReviewListener(); // Ініціалізація кнопки відправки перевіреного ДЗ
});

// =========================================================================
// 1. ЗАХИСТ СТОРІНКИ ТА П ПЕРЕВІРКА РОЛІ ВЧИТЕЛЯ
// =========================================================================
async function verifyTeacherSession() {
  const { data: { user } } = await teacherSupabase.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  
  const { data: profile } = await teacherSupabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();
    
  if (!profile || profile.role !== 'teacher') {
    alert("Доступ заборонено! Ви не є викладачем.");
    window.location.href = "dashboard.html"; 
    return;
  }
  
  document.getElementById('teacher-welcome').innerText = `Вітаємо, ${profile.full_name} 👋`;
}

// =========================================================================
// 2. ПЕРЕМИКАННЯ ВКЛАДОК МЕНЮ
// =========================================================================
function initTeacherMenu() {
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = link.getAttribute('data-tab');
      
      // Не пускаємо в робочу зону, якщо учень не обраний
      if (tabId === 'workspace' && !selectedStudentId) {
        alert("Спершу оберіть учня зі списку!");
        return;
      }
      switchTab(tabId);
    });
  });

  // Кнопка Виходу з системи
  document.querySelector('.logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm("Вийти з системи?")) {
      await teacherSupabase.auth.signOut();
      localStorage.clear();
      window.location.href = "login.html";
    }
  });
}

window.switchTab = function(tabId) {
  const links = document.querySelectorAll('.sidebar-link');
  
  links.forEach(l => l.classList.remove('active'));
  const targetLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
  if (targetLink) targetLink.classList.add('active');

  document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
  
  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.style.display = 'block';

  if (tabId === 'workspace' && globalCalendar) {
    setTimeout(() => { globalCalendar.updateSize(); }, 50);
  }
};

// =========================================================================
// 3. ЗАВАНТАЖЕННЯ УЧНІВ У ТАБЛИЦЮ CRM
// =========================================================================
async function loadStudentsForTeacher() {
  const tableBody = document.getElementById('students-table-body');
  if (!tableBody) return;

  const { data: students, error } = await teacherSupabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  if (error) {
    console.error("Помилка завантаження учнів:", error.message);
    return;
  }

  tableBody.innerHTML = "";

  students.forEach(student => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${student.full_name}</td>
      <td>
        <span class="level-badge">
          ${student.lessons_left || 0} уроків
        </span>
      </td>
      <td>
        <button class="manage-btn">
          <i class="fa-solid fa-graduation-cap"></i> Керувати
        </button>
      </td>
    `;

    tr.querySelector('.manage-btn').addEventListener('click', () => {
      openStudentWorkspace(student);
    });

    tableBody.appendChild(tr);
  });
}

// =========================================================================
// 4. СЕСІЯ КЕРУВАННЯ КОНКРЕТНИМ УЧНЕМ
// =========================================================================
function openStudentWorkspace(student) {
  selectedStudentId = student.id;
  selectedStudentName = student.full_name;

  document.getElementById('sidebar-student-name').innerText = student.full_name;
  let courseName = "Курс не обрано";
  if (student.learning_language) {
    const parts = student.learning_language.split(':');
    if (parts.length > 1) {
      courseName = parts[1];
    } else {
      courseName = parts[0];
    }
  }
  document.getElementById('workspace-student-title').innerText = `Учень: ${student.full_name} (${courseName})`;
  document.getElementById('workspace-student-lessons').innerText = `${student.lessons_left || 0} уроків`;

  document.getElementById('workspace-menu-item').style.display = 'block';

  // Ховаємо зону перевірки ДЗ, якщо вона була відкрита з минулим учнем
  const teacherEditorZone = document.getElementById('teacher-editor-zone');
  if (teacherEditorZone) teacherEditorZone.classList.add('hidden');

  switchTab('workspace');

  initOrRefreshCalendar();
  loadTeacherHomeworkJournal(student.id); // АВТОМАТИЧНО завантажуємо ДЗ цього учня!
}

// =========================================================================
// 5. РОБОТА З FULLCALENDAR
// =========================================================================
async function initOrRefreshCalendar() {
  const calendarEl = document.getElementById('calendar-element');
  if (!calendarEl) return;

  const { data: DB_Lessons, error } = await teacherSupabase
    .from('lessons')
    .select('*')
    .eq('student_id', selectedStudentId);

  if (error) {
    console.error("Помилка при завантаженні розкладу:", error.message);
  }

  const formattedEvents = (DB_Lessons || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title || `Урок: ${selectedStudentName}`,
    start: lesson.start_time, 
    end: lesson.end_time,
    backgroundColor: '#a855f7',
    borderColor: '#9333ea'
  }));

  if (!globalCalendar) {
    globalCalendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek', 
      locale: 'uk',
      firstDay: 1, 
      slotMinTime: '08:00:00', 
      slotMaxTime: '22:00:00', 
      allDaySlot: false,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,timeGridDay'
      },
      selectable: true,
      events: formattedEvents,
      
      select: async function(info) {
        if (!selectedStudentId) return;

        if (confirm(`Запланувати новий урок для ${selectedStudentName}?`)) {
          const { data: newLesson, error: insertError } = await teacherSupabase
            .from('lessons')
            .insert([{ 
              title: `Урок: ${selectedStudentName}`,
              start_time: info.startStr, 
              end_time: info.endStr,
              student_id: selectedStudentId
            }])
            .select()
            .single();

          if (!insertError) {
            globalCalendar.addEvent({
              id: newLesson.id,
              title: `Урок: ${selectedStudentName}`,
              start: info.startStr,
              end: info.endStr
            });
            alert('Урок успішно додано до розкладу!');
          } else {
            alert('Помилка бази даних Supabase: ' + insertError.message);
          }
        }
        globalCalendar.unselect();
      },

      eventClick: async function(info) {
        const action = prompt(`Що зробити з уроком "${info.event.title}"?\n\n1 - Урок проведено (списати з балансу учня)\n2 - Просто видалити (скасувати урок)`);
        
        if (action === '1') {
          // Урок проведено: зменшуємо кількість уроків
          const { data: profile } = await teacherSupabase
            .from('profiles')
            .select('lessons_left')
            .eq('id', selectedStudentId)
            .single();
            
          let newBalance = (profile?.lessons_left || 0) - 1;
          if (newBalance < 0) newBalance = 0;

          const { error: updateError } = await teacherSupabase
            .from('profiles')
            .update({ lessons_left: newBalance })
            .eq('id', selectedStudentId);

          if (!updateError) {
            await teacherSupabase.from('lessons').delete().eq('id', info.event.id);
            info.event.remove();
            
            // Оновлюємо UI
            document.getElementById('workspace-student-lessons').innerText = `${newBalance} уроків`;
            alert(`Урок успішно проведено! Баланс учня зменшено. Залишилось: ${newBalance} уроків.`);
            
            // Оновлюємо таблицю учнів
            loadStudentsForTeacher();
          } else {
            alert('Помилка при оновленні балансу: ' + updateError.message);
          }
        } else if (action === '2') {
          if (confirm(`Ви впевнені, що хочете просто видалити урок без списання з балансу?`)) {
            const { error } = await teacherSupabase
              .from('lessons')
              .delete()
              .eq('id', info.event.id);

            if (!error) {
              info.event.remove();
              alert('Урок скасовано без списання.');
            } else {
              alert('Не вдалося видалити урок: ' + error.message);
            }
          }
        }
      }
    });
    globalCalendar.render();
  } else {
    globalCalendar.removeAllEvents();
    globalCalendar.addEventSource(formattedEvents);
    globalCalendar.render();
  }
}

const addLessonBtn = document.getElementById('add-lesson-btn');
if (addLessonBtn) {
  addLessonBtn.addEventListener('click', () => {
    if (globalCalendar) {
      alert("Просто виділіть мишкою або пальцем потрібний час прямо в сітці календаря нижче!");
    }
  });
}

// =========================================================================
// 6. СТВОРЕННЯ ТА НАДСИЛАННЯ НОВОГО ДЗ (ВИПРАВЛЕНО + ДЕБАГ)
// =========================================================================
function handleHomeworkPosting() {
  const form = document.getElementById('teacher-hw-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedStudentId) {
      alert('Помилка: Спершу оберіть учня на головній сторінці!');
      return;
    }

    const title = document.getElementById('hw-input-title').value;
    const desc = document.getElementById('hw-input-desc').value;
    const deadline = document.getElementById('hw-input-deadline').value;

    const fileInput = document.getElementById('hw-input-file');
    const file = fileInput ? fileInput.files[0] : null;
    let uploadedImageUrl = null;

    console.log("=== Старт відправки ДЗ ===");
    console.log("Учень ID:", selectedStudentId);
    console.log("Файл з інпуту:", file);

    // Кнопка відправки з індикатором завантаження
    const submitBtn = form.querySelector('.submit-hw-btn');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Надсилаю...`;
    }

    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        // Фікс: Робимо плаский шлях без підпапок, щоб Supabase не блокував запис
        const filePath = `hw_${selectedStudentId}_${Date.now()}.${fileExt}`;
        
        console.log("Спроба завантаження файлу в сховище під ім'ям:", filePath);

        const { data: uploadData, error: uploadError } = await teacherSupabase
          .storage
          .from('homework-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error("Помилка від самого Supabase Storage при завантаженні:", uploadError);
          throw uploadError;
        }

        console.log("Файл успішно завантажено. Отримуємо публічне посилання...");

        const { data: { publicUrl } } = teacherSupabase
          .storage
          .from('homework-attachments')
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;
        console.log("Згенерований Public URL файлу:", uploadedImageUrl);

      } catch (storageErr) {
        console.error("Перехоплена помилка блоку Storage:", storageErr);
        
        const proceed = confirm(
          `⚠️ Не вдалося завантажити файл:\n"${storageErr.message || storageErr}"\n\n` +
          `Відправити завдання БЕЗ файлу? (Учень побачить лише текст опису)`
        );
        if (!proceed) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          return;
        }
        uploadedImageUrl = null; // Продовжуємо без файлу
      }
    }

    try {
      console.log("Запис ДЗ в таблицю 'homeworks'...");
      const { error: dbError } = await teacherSupabase.from('homeworks').insert([
        {
          student_id: selectedStudentId,
          title: title,
          description: desc,
          deadline: deadline,
          attachment_url: uploadedImageUrl,
          status: 'pending'
        }
      ]);

      if (!dbError) {
        const fileNote = uploadedImageUrl ? '' : ' (без прикріпленого файлу)';
        alert(`✅ Домашнє завдання успішно опубліковано для учня ${selectedStudentName}!${fileNote}`);
        form.reset();
        loadTeacherHomeworkJournal(selectedStudentId);
      } else {
        console.error("Помилка запису в БД таблицю homeworks:", dbError);
        alert(`Помилка запису в базу даних: ${dbError.message}`);
      }
    } catch (dbCatchErr) {
      console.error("Загальний збій при роботі з БД:", dbCatchErr);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
      console.log("=== Кінець процесу відправки ===");
    }
  });
}


// =========================================================================
// 8. ІНТЕРАКТИВНА ДОШКА ПЕРЕВІРКИ ДЛЯ ВЧИТЕЛЯ (ПОВНА ПРЕМІУМ-ВЕРСІЯ)
// =========================================================================

window.openTeacherReviewEditor = function(imageUrl, homeworkId, currentComment = "") {
  console.log("=== ВІДКРИТТЯ ДОШКИ ВЧИТЕЛЯ ===");
  console.log("Отримано imageUrl:", imageUrl);
  console.log("Отримано homeworkId:", homeworkId);

  currentReviewHomeworkId = homeworkId;
  const editorZone = document.getElementById('teacher-editor-zone');
  
  if (editorZone) {
    editorZone.classList.remove('hidden');
    
    // Автоматично заповнюємо текстове поле коментаря, якщо вчитель раніше вже щось писав
    const feedbackField = document.getElementById('t-teacher-feedback');
    if (feedbackField) {
      feedbackField.value = currentComment || "";
    }

    // Перевіряємо, чи посилання валідне. Якщо це null, undefined або пустий рядок — передаємо пустий рядок
    const validUrl = (imageUrl && imageUrl !== "null" && imageUrl !== "undefined" && imageUrl.trim() !== "") ? imageUrl : "";

    initTeacherCanvas(validUrl);
    editorZone.scrollIntoView({ behavior: 'smooth' });
  }
};

function initTeacherCanvas(imageUrl) {
  tCanvas = document.getElementById('teacher-canvas');
  if (!tCanvas) return;
  tCtx = tCanvas.getContext('2d');

  // ФІКС ДЛЯ ЗАВДАНЬ БЕЗ КАРТИНКИ: Якщо посилання порожнє, створюємо чистий білий аркуш
  if (!imageUrl) {
    console.log("Зображення відсутнє. Створюю чистий білий аркуш для малювання.");
    tCanvas.width = 850;
    tCanvas.height = 600;
    
    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
    tCtx.lineCap = 'round';
    tCtx.lineJoin = 'round';

    tUndoStack = [];
    tUndoStack.push(tCanvas.toDataURL()); // Знімок чистого білого екрана
    tBgImage = new Image(); // Очищуємо старе тло
  } else {
    // Звичайний режим: завантажуємо малюнок із бази даних
    tBgImage = new Image();
    tBgImage.crossOrigin = "anonymous"; 
    tBgImage.src = imageUrl;
    
    tBgImage.onload = function() {
      const maxWidth = 850;
      tCanvas.width = tBgImage.width > maxWidth ? maxWidth : tBgImage.width;
      const scale = tCanvas.width / tBgImage.width;
      tCanvas.height = tBgImage.height * scale;

      tCtx.drawImage(tBgImage, 0, 0, tCanvas.width, tCanvas.height);
      tCtx.lineCap = 'round';
      tCtx.lineJoin = 'round';

      tUndoStack = [];
      tUndoStack.push(tCanvas.toDataURL()); // Перший чистий знімок екрана
    };

    tBgImage.onerror = function(err) {
      console.error("Помилка завантаження фото в Canvas викладача. Спроба створити білий аркуш.", err);
      tCanvas.width = 850;
      tCanvas.height = 600;
      tCtx.fillStyle = "#ffffff";
      tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
      tUndoStack = [tCanvas.toDataURL()];
    };
  }

  tCanvas.onmousedown = handleTeacherMouseDown;
  tCanvas.onmousemove = handleTeacherMouseMove;
  tCanvas.onmouseup = handleTeacherMouseUp;
  tCanvas.onmouseout = handleTeacherMouseUp;

  setupTeacherToolbarListeners();
  
  // АВТО-ЗАПУСК: Активуємо слухач кнопки збереження відразу при ініціалізації дошки!
  initTeacherSaveReviewListener();
}

function saveTeacherState() {
  if (tUndoStack.length > 20) tUndoStack.shift();
  tUndoStack.push(tCanvas.toDataURL());
}

// ТОЧНИЙ КЛІК ТА СТВОРЕННЯ ПОЛЯ ВВЕДЕННЯ ТЕКСТУ
function handleTeacherMouseDown(e) {
  const rect = tCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (tActiveTextarea) {
    finalizeTeacherLiveText();
    return;
  }

  if (tCurrentTool === 'text') {
    const size = document.getElementById('t-editor-size').value;
    const color = document.getElementById('t-editor-color').value;
    const fontSize = parseInt(size) * 2 + 14;

    const textarea = document.createElement('textarea');
    textarea.className = 'canvas-live-textarea';
    
    textarea.style.left = `${x}px`;
    textarea.style.top = `${y}px`;
    textarea.style.fontSize = `${fontSize}px`;
    textarea.style.color = color;
    textarea.style.lineHeight = '1.2';

    textarea.dataset.canvasX = x.toString();
    textarea.dataset.canvasY = y.toString();

    const wrapper = document.getElementById('t-canvas-wrapper') || tCanvas.parentElement;
    wrapper.appendChild(textarea);
    
    setTimeout(() => textarea.focus(), 10);

    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    });

    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        finalizeTeacherLiveText();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        textarea.remove();
        tActiveTextarea = null;
      }
    });

    tActiveTextarea = textarea;
    return;
  }

  tIsDrawing = true;
  tLastX = x;
  tLastY = y;
}

function finalizeTeacherLiveText() {
  if (!tActiveTextarea) return;

  const text = tActiveTextarea.value.trim();
  if (text !== "") {
    const x = parseFloat(tActiveTextarea.dataset.canvasX);
    const y = parseFloat(tActiveTextarea.dataset.canvasY);
    const fontSize = parseFloat(tActiveTextarea.style.fontSize);
    const color = tActiveTextarea.style.color;

    tCtx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
    tCtx.fillStyle = color;
    tCtx.textBaseline = 'top';
    
    const lines = text.split('\n');
    let currentY = y;
    lines.forEach(line => {
      tCtx.fillText(line, x, currentY);
      currentY += fontSize * 1.2; 
    });

    saveTeacherState();
  }

  tActiveTextarea.remove();
  tActiveTextarea = null;
}

function handleTeacherMouseMove(e) {
  if (!tIsDrawing || tCurrentTool === 'text') return;
  
  const rect = tCanvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  tCtx.beginPath();
  tCtx.moveTo(tLastX, tLastY);
  tCtx.lineTo(currentX, currentY);

  const size = document.getElementById('t-editor-size').value;

  if (tCurrentTool === 'eraser') {
    tCtx.save();
    tCtx.beginPath();
    tCtx.arc(currentX, currentY, size * 1.5, 0, Math.PI * 2);
    tCtx.clip();
    tCtx.drawImage(tBgImage, 0, 0, tCanvas.width, tCanvas.height);
    tCtx.restore();
  } else {
    tCtx.strokeStyle = document.getElementById('t-editor-color').value;
    tCtx.lineWidth = size;
    tCtx.stroke();
  }

  tLastX = currentX;
  tLastY = currentY;
}

function handleTeacherMouseUp() {
  if (tIsDrawing) {
    tIsDrawing = false;
    saveTeacherState();
  }
}

// ✅ ПЕРЕМИКАЧ ПОВНОГО ЕКРАНУ
window.toggleTeacherFullscreen = function() {
  const zone = document.getElementById('teacher-editor-zone');
  const fullscreenBtn = document.getElementById('t-btn-fullscreen');
  
  if (!zone) return;

  zone.classList.toggle('fullscreen-mode');
  isFullscreenActive = zone.classList.contains('fullscreen-mode');
  
  if (fullscreenBtn) {
    if (isFullscreenActive) {
      fullscreenBtn.innerHTML = `<i class="fa-solid fa-compress"></i> Згорнути`;
      if (tActiveTextarea) finalizeTeacherLiveText(); 
    } else {
      fullscreenBtn.innerHTML = `<i class="fa-solid fa-expand"></i> Повний екран`;
    }
  }
};

function setupTeacherToolbarListeners() {
  const brushBtn = document.getElementById('t-tool-brush');
  const textBtn = document.getElementById('t-tool-text');
  const eraserBtn = document.getElementById('t-tool-eraser');
  const undoBtn = document.getElementById('t-tool-undo');
  const clearBtn = document.getElementById('t-tool-clear');

  if (brushBtn && textBtn && eraserBtn) {
    brushBtn.onclick = () => { if (tActiveTextarea) finalizeTeacherLiveText(); tCurrentTool = 'brush'; setActiveTool(brushBtn); };
    textBtn.onclick = () => { tCurrentTool = 'text'; setActiveTool(textBtn); };
    eraserBtn.onclick = () => { if (tActiveTextarea) finalizeTeacherLiveText(); tCurrentTool = 'eraser'; setActiveTool(eraserBtn); };
  }

  function setActiveTool(activeBtn) {
    [brushBtn, textBtn, eraserBtn].forEach(b => b && b.classList.remove('tool-active'));
    if (activeBtn) activeBtn.classList.add('tool-active');
  }

  if (undoBtn) {
    undoBtn.onclick = () => {
      if (tActiveTextarea) finalizeTeacherLiveText();
      if (tUndoStack.length > 1) {
        tUndoStack.pop();
        const img = new Image();
        img.src = tUndoStack[tUndoStack.length - 1];
        img.onload = () => {
          tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
          tCtx.drawImage(img, 0, 0);
        };
      }
    };
  }

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm("Скасувати всі ваші виправлення?")) {
        if (tActiveTextarea) { tActiveTextarea.remove(); tActiveTextarea = null; }
        tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
        tCtx.drawImage(tBgImage, 0, 0, tCanvas.width, tCanvas.height);
        tUndoStack = [tCanvas.toDataURL()];
      }
    };
  }

  // Вихід з повного екрана по кнопці Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreenActive) {
      window.toggleTeacherFullscreen();
    }
  });
}

// =========================================================================
// 9. ЗБЕРЕЖЕННЯ ПЕРЕВІРЕНОГО ЗАВДАННЯ В СХОВИЩЕ ТА БАЗУ
// =========================================================================
function initTeacherSaveReviewListener() {
  const saveBtn = document.getElementById('btn-teacher-save-review');
  if (!saveBtn) return;

  saveBtn.onclick = async function() {
    if (tActiveTextarea) finalizeTeacherLiveText();

    if (!currentReviewHomeworkId) {
      alert("Помилка: Не знайдено ID домашнього завдання для рецензування!");
      return;
    }

    const feedbackField = document.getElementById('t-teacher-feedback');
    const teacherCommentText = feedbackField ? feedbackField.value.trim() : "";

    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Зберігаю рецензію...`;

    try {
      const blob = await new Promise(resolve => tCanvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Не вдалося згенерувати зображення з дошки.");

      const fileName = `reviews/${currentReviewHomeworkId}_reviewed_${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await teacherSupabase
        .storage
        .from('homework-attachments')
        .upload(fileName, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = teacherSupabase
        .storage
        .from('homework-attachments')
        .getPublicUrl(fileName);

      let updatePayload = { 
        status: 'reviewed', 
        student_response_url: publicUrl,
        teacher_comment: teacherCommentText 
      };

      const { error: dbError } = await teacherSupabase
        .from('homeworks')
        .update(updatePayload)
        .eq('id', currentReviewHomeworkId);

      if (dbError && dbError.code === 'PGRST204') {
        const { error: statusOnlyError } = await teacherSupabase
          .from('homeworks')
          .update({ 
            status: 'reviewed',
            teacher_comment: teacherCommentText 
          })
          .eq('id', currentReviewHomeworkId);
          
        if (statusOnlyError) throw statusOnlyError;
      } else if (dbError) {
        throw dbError;
      }

      alert("🎉 Завдання успішно перевірено! Учень побачить ваші виправлення та текстовий коментар.");
      
      const zone = document.getElementById('teacher-editor-zone');
      if (zone) {
        zone.classList.add('hidden');
        zone.classList.remove('fullscreen-mode');
      }
      isFullscreenActive = false;

      if (typeof loadTeacherHomeworkJournal === "function") {
        loadTeacherHomeworkJournal(selectedStudentId);
      } else if (typeof loadTeacherHomeworkLog === "function") {
        loadTeacherHomeworkLog(selectedStudentId);
      }

    } catch (err) {
      console.error("Помилка збереження рецензії:", err);
      alert(`Помилка: ${err.message}`);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}
// ==========================================================================
// ЛОГІКА ДЛЯ МОДЕРАЦІЇ ВІДГУКІВ (SUPABASE)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.getElementById('admin-comments-list');
  const totalCountText = document.getElementById('total-comments-count');

  // 1. Захист від XSS (щоб ніхто не зламав адмінку шкідливим кодом у тексті відгуку)
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  // 2. Головна функція завантаження відгуків з Supabase
  async function loadAdminComments() {
    if (!listContainer) return;

    // Використовуємо твій supabaseClient
    let { data: comments, error } = await supabaseClient
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Помилка Supabase:', error);
      listContainer.innerHTML = `<p style="text-align:center; color:#ef4444; padding:20px;">Помилка завантаження даних з бази.</p>`;
      return;
    }

    if (totalCountText) totalCountText.innerText = comments.length;
    listContainer.innerHTML = '';

    if (comments.length === 0) {
      listContainer.innerHTML = `<p style="text-align:center; color:#9ca3af; padding:20px;">Відгуків від студентів наразі немає.</p>`;
      return;
    }

    // Рендеринг відгуків
    comments.forEach(comment => {
      const card = document.createElement('div');
      card.className = 'admin-comment-card';

      // Красива фірмова аватарка NovaFlow
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.name)}&background=5E077E&color=fff&rounded=true&size=128&font-size=0.45&bold=true`;
      const dateFormatted = new Date(comment.created_at).toLocaleString('uk-UA');
      const hasReply = comment.teacher_reply !== null && comment.teacher_reply !== '';

      // НОВЕ: Отримуємо оцінку з бази (якщо порожньо — ставимо 5 за замовчуванням)
      const currentRating = comment.rating || 5;
      
      // НОВЕ: Генеруємо 5 зірочок для відображення в адмінці
      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        const starColor = i <= currentRating ? '#FFB020' : '#E2E8F0';
        starsHTML += `<svg viewBox="0 0 20 20" style="color: ${starColor}; fill: currentColor; width: 16px; height: 16px; display: inline-block; margin-right: 2px;"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
      }

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
          <div style="display: flex; gap: 14px;">
            <div class="user-avatar">
              <img src="${avatarUrl}" alt="avatar">
            </div>
            <div>
              <h4 style="margin: 0 0 4px 0; font-size: 15.5px; color: #0F172A; font-weight: 600;">${escapeHTML(comment.name)}</h4>
              
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 12px; color: #94A3B8;">${dateFormatted}</span>
                <div style="display: flex; align-items: center;">
                  ${starsHTML}
                </div>
              </div>

              <p style="margin: 8px 0 0 0; color: #334155; font-size: 14.5px; line-height: 1.5;">${escapeHTML(comment.text)}</p>
            </div>
          </div>
          <div class="admin-actions-wrapper">
            <button class="btn-delete" data-id="${comment.id}">Видалити</button>
          </div>
        </div>

        <div class="admin-reply-section">
          ${hasReply ? `<div class="current-reply-box"><strong>Ваша відповідь:</strong> ${escapeHTML(comment.teacher_reply)}</div>` : ''}
          <div class="admin-reply-form">
            <input type="text" id="reply-input-${comment.id}" placeholder="${hasReply ? 'Змінити відповідь викладача...' : 'Напишіть відповідь від імені NovaFlow...'}" class="admin-reply-input">
            <button class="btn-submit-reply" data-id="${comment.id}">
              ${hasReply ? 'Оновити' : 'Відповісти'}
            </button>
          </div>
        </div>
      `;

      listContainer.appendChild(card);
    });

    // 3. Обробник кнопки видалення відгуку
    document.querySelectorAll('.btn-delete').forEach(button => {
      button.removeEventListener('click', handleDelete); // Запобігаємо дублюванню подій
      button.addEventListener('click', handleDelete);
    });

    // 4. Обробник кнопки збереження/оновлення відповіді викладача
    document.querySelectorAll('.btn-submit-reply').forEach(button => {
      button.removeEventListener('click', handleReply); // Запобігаємо дублюванню подій
      button.addEventListener('click', handleReply);
    });
  }

  // Допоміжна функція видалення
  async function handleDelete(e) {
    const id = e.target.getAttribute('data-id');
    if (confirm('Ви впевнені, що хочете остаточно видалити цей відгук із сайту?')) {
      const { error } = await supabaseClient.from('comments').delete().eq('id', id);
      if (!error) {
        loadAdminComments();
      } else {
        alert('Не вдалося видалити відгук.');
      }
    }
  }

  // Допоміжна функція відповіді
  async function handleReply(e) {
    const id = e.target.getAttribute('data-id');
    const inputField = document.getElementById(`reply-input-${id}`);
    const replyText = inputField.value.trim();

    if (!replyText) return;

    const { error } = await supabaseClient
      .from('comments')
      .update({ teacher_reply: replyText })
      .eq('id', id);

    if (!error) {
      inputField.value = '';
      loadAdminComments();
    } else {
      alert('Не вдалося зберегти відповідь.');
    }
  }

  // 5. Інтеграція перемикання табів (вкладок)
  const commentsTabBtn = document.querySelector('[data-tab="comments"]');
  
  if (commentsTabBtn) {
    commentsTabBtn.addEventListener('click', (e) => {
      e.preventDefault();

      document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');

      commentsTabBtn.classList.add('active');
      
      const commentsTabContainer = document.getElementById('tab-comments');
      if (commentsTabContainer) {
        commentsTabContainer.style.display = 'block';
      }

      loadAdminComments();
    });
  }
});

// Логіка перемикання вкладок у Сайдбарі
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const tabContents = document.querySelectorAll('.tab-content');

sidebarLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    const targetTab = link.getAttribute('data-tab');
    
    // Видаляємо active клас у всіх посилань та вкладок
    sidebarLinks.forEach(l => l.classList.remove('active'));
    tabContents.forEach(tab => tab.style.display = 'none'); // Або classList.remove('active') залежно від твого CSS
    
    // Додаємо active потрібній вкладці
    link.classList.add('active');
    const activeTabEl = document.getElementById(`tab-${targetTab}`);
    if (activeTabEl) {
      activeTabEl.style.display = 'block';
    }
    
    // Якщо вчитель переходить на вкладку "Головна", оновлюємо великий календар, щоб він рівно перемалювався
    if (targetTab === 'dashboard' && window.generalCalendar) {
      window.generalCalendar.render();
    }
  });
});


document.addEventListener('DOMContentLoaded', async () => {
  // Твій існуючий код завантаження учнів...
  
  // Ініціалізація Загального Календаря на Головній
  const generalCalendarEl = document.getElementById('general-calendar-element');
  
  if (generalCalendarEl) {
    window.generalCalendar = new FullCalendar.Calendar(generalCalendarEl, {
      initialView: 'timeGridWeek', // Тижнева сітка (найзручніше для розкладу)
      slotMinTime: '08:00:00',     // Початок робочого дня
      slotMaxTime: '22:00:00',     // Кінець робочого дня
      locale: 'uk',                // Українська мова
      firstDay: 1,                 // Понеділок — перший день тижня
      allDaySlot: false,
      editable: false,             // СУВОРЕ ОБМЕЖЕННЯ: перетягувати чи змінювати розмір подій НЕ МОЖНА
      selectable: false,           // Створювати нові події кліком на пусте місце ТУТ НЕ МОЖНА
      
      // Подія при кліку на урок
      eventClick: function(info) {
        // Зчитуємо приховані дані про учня, які ми зашили в івент
        const studentId = info.event.extendedProps.studentId;
        const studentName = info.event.extendedProps.studentName;
        
        if (studentId) {
          alert(`Переходимо до профілю учня: ${studentName} для редагування розкладу.`);
          
          // Викликаємо функцію перемикання в Робочу зону (код нижче)
          switchToStudentWorkspace(studentId, studentName);
        }
      }
    });
    
    window.generalCalendar.render();
    
    // Одразу запускаємо функцію, яка витягне з Supabase ВСІ уроки вчителя і закине в календар
    await loadGeneralCalendarEvents();
    
    // Завантажуємо статистику (активні учні, уроки цього тижня, наступний урок)
    await loadDashboardStats();
  }
});


// =========================================================================
// 10. ЗАВАНТАЖЕННЯ СТАТИСТИКИ ТА НАСТУПНОГО УРОКУ (ГОЛОВНА)
// =========================================================================

async function loadDashboardStats() {
  try {
    // 1. Активні учні
    const { count: studentsCount, error: studentsError } = await teacherSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
      
    if (!studentsError && studentsCount !== null) {
      document.getElementById('stat-active-students').innerText = studentsCount;
    }

    // 2. Завантажуємо всі уроки для аналізу
    const { data: lessons, error: lessonsError } = await teacherSupabase
      .from('lessons')
      .select(`
        id,
        start_time,
        end_time,
        title,
        student_id,
        profiles:student_id ( full_name )
      `);
      
    if (lessonsError) throw lessonsError;

    const now = new Date();
    
    // Уроків цього тижня
    const dayOfWeek = now.getDay() || 7; 
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let weeklyCount = 0;
    
    // Наступний урок
    let nextLesson = null;
    let minTimeDiff = Infinity;

    (lessons || []).forEach(lesson => {
      const lessonStart = new Date(lesson.start_time);
      
      if (lessonStart >= startOfWeek && lessonStart <= endOfWeek) {
        weeklyCount++;
      }
      
      const timeDiff = lessonStart - now;
      if (timeDiff > 0 && timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        nextLesson = lesson;
      }
    });

    document.getElementById('stat-weekly-lessons').innerText = weeklyCount;

    if (nextLesson) {
      const studentName = nextLesson.profiles?.full_name || 'Невідомий учень';
      document.getElementById('next-lesson-student').innerText = studentName;
      document.getElementById('next-lesson-topic').innerText = `Тема: ${nextLesson.title || 'Урок'}`;
      
      updateCountdown(nextLesson.start_time);
    } else {
      document.getElementById('next-lesson-student').innerText = 'Немає майбутніх уроків';
      document.getElementById('next-lesson-topic').innerText = 'Тема: -';
      document.getElementById('next-lesson-countdown').innerText = 'Відпочивайте!';
    }
    
  } catch (err) {
    console.error("Помилка завантаження статистики:", err);
  }
}

let countdownInterval;
function updateCountdown(targetTimeStr) {
  if (countdownInterval) clearInterval(countdownInterval);
  
  const targetTime = new Date(targetTimeStr).getTime();
  
  function updateText() {
    const now = new Date().getTime();
    const distance = targetTime - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      document.getElementById('next-lesson-countdown').innerText = 'Урок почався!';
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    let text = '';
    if (days > 0) text += `${days} дн `;
    text += `${hours} год ${minutes} хв`;
    
    document.getElementById('next-lesson-countdown').innerText = text;
  }
  
  updateText();
  countdownInterval = setInterval(updateText, 1000);
}

async function switchToStudentWorkspace(studentId, studentName) {
  const { data: student } = await supabaseClient.from('profiles').select('*').eq('id', studentId).single();
  if (student) {
    openStudentWorkspace(student);
  } else {
    openStudentWorkspace({ id: studentId, full_name: studentName, lessons_left: 0 });
  }
}

async function loadGeneralCalendarEvents() {
  if (!window.generalCalendar) return;
  
  // Тягнемо з бази уроки, а також джоїнимо ім'я учня (profiles / students)
  const { data: lessons, error } = await supabaseClient
    .from('lessons') // Твоя таблиця уроків
    .select(`
      id,
      start_time,
      end_time,
      title,
      student_id,
      profiles:student_id ( full_name ) 
    `);

  if (error) {
    console.error('Помилка завантаження загального розкладу:', error);
    return;
  }

  // Очищаємо старі івенти перед додаванням нових
  window.generalCalendar.removeAllEvents();

  // Переганяємо дані у формат, який розуміє FullCalendar
  lessons.forEach(lesson => {
    const studentName = lesson.profiles?.full_name || 'Невідомий учень';
    
    window.generalCalendar.addEvent({
      id: lesson.id,
      title: `${studentName} — ${lesson.title || 'Урок'}`,
      start: lesson.start_time,
      end: lesson.end_time,
      backgroundColor: '#7C3AED', // Фіолетовий колір для загальних уроків
      borderColor: '#5E077E',
      
      // Зашиваємо додаткові параметри всередину івенту (extendedProps)
      extendedProps: {
        studentId: lesson.student_id,
        studentName: studentName
      }
    });
  });
}



// =========================================================================
// 11. МОБІЛЬНЕ МЕНЮ ДЛЯ ВЧИТЕЛІВ (БУРГЕР)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const burgerBtn = document.getElementById('dash-burger-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('dash-sidebar-overlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-link');

  // Функція перемикання меню
  const toggleSidebar = () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  };

  if (burgerBtn) burgerBtn.addEventListener('click', toggleSidebar);
  if (overlay) overlay.addEventListener('click', toggleSidebar);

  // Автоматично закривати сайдбар на мобільних після вибору вкладки
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    });
  });
});


// =========================================================================
// КЕРУВАННЯ ЖУРНАЛОМ ДЗ: ЗАВАНТАЖЕННЯ, МОДАЛЬНИЙ ПЕРЕГЛЯД ТА ВИДАЛЕННЯ
// =========================================================================

/**
 * 1. Завантаження та рендеринг історії завдань для обраного учня
 */
async function loadTeacherHomeworkJournal(studentId) {
  const tbody = document.getElementById('teacher-homework-list-tbody');
  if (!tbody) return;

  console.log("Завантаження історії ДЗ для учня з ID:", studentId);

  try {
    // Робимо запит до Supabase, сортуємо від найновіших за датою створення
    const { data: homeworks, error } = await teacherSupabase
      .from('homeworks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Якщо завдань немає — виводимо красиву інформативну заглушку
    if (!homeworks || homeworks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="table-empty-row" style="text-align: center; padding: 24px; color: #6b7280; font-style: italic;">
            У цього учня ще немає заданих домашніх завдань.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = ''; // Очищаємо вміст перед новим рендером

    homeworks.forEach((hw) => {
      // Генерація бейджів статусів
      let statusBadge = '';
      if (hw.status === 'pending') {
        statusBadge = '<span style="background: #fef3c7; color: #d97706; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">Очікує</span>';
      } else if (hw.status === 'completed') {
        statusBadge = '<span style="background: #d1fae5; color: #059669; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">Виконано</span>';
      } else if (hw.status === 'reviewed') {
        statusBadge = '<span style="background: #e0e7ff; color: #4f46e5; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">Перевірено</span>';
      }

      // Обробка дати дедлайну для гарного відображення
      const deadlineStr = hw.deadline 
        ? new Date(hw.deadline).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) 
        : 'Не вказано';

      // Генерація динамічної кнопки перегляду залежно від наявності файлу в attachment_url
      let actionFileBtn = '';
      if (hw.attachment_url && hw.attachment_url !== 'null') {
        // Якщо є файл — створюємо яскраву синю кнопку з передачею екранованого безпечного Base64 тексту
        const b64Title = btoa(unescape(encodeURIComponent(hw.title || '')));
        const b64Desc = btoa(unescape(encodeURIComponent(hw.description || '')));
        
        actionFileBtn = `
          <button type="button" class="dash-btn" onclick="openHwPreviewModal('${b64Title}', '${b64Desc}', '${hw.attachment_url}')" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; margin-right: 6px; display: inline-flex; align-items: center; gap: 6px;" title="Переглянути прикріплений файл">
            <i class="fa-solid fa-image"></i> Файл
          </button>`;
      } else {
        // Якщо файлу не було — створюємо акуратну сіру кнопку-заглушку, яка відкриє лише опис тексту завдання
        const b64Title = btoa(unescape(encodeURIComponent(hw.title || '')));
        const b64Desc = btoa(unescape(encodeURIComponent(hw.description || '')));

        actionFileBtn = `
          <button type="button" class="dash-btn" onclick="openHwPreviewModal('${b64Title}', '${b64Desc}', '')" style="background: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; margin-right: 6px; display: inline-flex; align-items: center; gap: 6px;" title="Переглянути текстовий опис завдання">
            <i class="fa-solid fa-file-lines"></i> Текст
          </button>`;
      }

      // Кнопка перевірки ДЗ вчителем (Canvas-дошка) — тільки якщо учень здав або вже перевірено
      let reviewBtn = '';
      // Визначаємо зображення для рецензування: пріоритет на відповідь учня, потім оригінал
      let finalImg = '';
      if (hw.student_response_url && hw.student_response_url !== 'null' && hw.student_response_url !== 'undefined') {
        finalImg = hw.student_response_url;
      } else if (hw.attachment_url && hw.attachment_url !== 'null' && hw.attachment_url !== 'undefined') {
        finalImg = hw.attachment_url;
      }
      const currentComment = hw.teacher_comment ? hw.teacher_comment.replace(/'/g, "\\'").replace(/"/g, "&quot;") : '';

      if (hw.status === 'completed' || hw.status === 'done') {
        reviewBtn = `
          <button type="button" class="manage-btn" style="background: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 6px; display: inline-flex; align-items: center; gap: 6px;" 
                  onclick="window.openTeacherReviewEditor('${finalImg}', '${hw.id}', '${currentComment}')">
            <i class="fa-solid fa-file-signature"></i> Перевірити
          </button>`;
      } else if (hw.status === 'reviewed') {
        reviewBtn = `
          <button type="button" class="manage-btn" style="background: #4b5563; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 6px; display: inline-flex; align-items: center; gap: 6px;"
                  onclick="window.openTeacherReviewEditor('${finalImg}', '${hw.id}', '${currentComment}')">
            <i class="fa-solid fa-eye"></i> Редагувати
          </button>`;
      }

      // Кнопка остаточного видалення завдання (червоний кошик)
      const deleteBtn = `
        <button type="button" class="dash-btn" onclick="deleteHomework('${hw.id}', '${hw.attachment_url}')" style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="Видалити це завдання">
          <i class="fa-solid fa-trash-can"></i>
        </button>`;

      // Формуємо рядок таблиці
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500; color: #111827; padding: 12px 8px;">${hw.title}</td>
        <td style="color: #4b5563; padding: 12px 8px;">${deadlineStr}</td>
        <td style="padding: 12px 8px;">${statusBadge}</td>
        <td style="white-space: nowrap; padding: 12px 8px;">
          ${reviewBtn}
          ${actionFileBtn}
          ${deleteBtn}
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Критичний збій при завантаженні журналу ДЗ:", err);
  }
}

/**
 * 2. Безпечне розпакування тексту та відкриття модального вікна перегляду ДЗ
 */
window.openHwPreviewModal = function(encodedTitle, encodedDesc, fileUrl) {
  const modal = document.getElementById('hw-file-preview-modal');
  const modalTitle = document.getElementById('preview-modal-title');
  const modalDesc = document.getElementById('preview-modal-desc');
  const modalImg = document.getElementById('preview-modal-img');
  const imgContainer = document.getElementById('preview-image-container');

  if (!modal || !modalTitle || !modalDesc) return;

  // Декодуємо рядки назад з Base64 без пошкодження українських літер
  const title = decodeURIComponent(escape(atob(encodedTitle)));
  const desc = decodeURIComponent(escape(atob(encodedDesc)));

  modalTitle.innerText = title || "Без теми";
  modalDesc.innerText = desc || "Опис відсутній.";

  // Якщо файл є — показуємо картинку, якщо немає — приховуємо контейнер зображення, щоб вікно було компактним
  if (fileUrl && fileUrl !== 'null' && fileUrl.trim() !== '') {
    modalImg.src = fileUrl;
    imgContainer.style.display = 'flex';
  } else {
    modalImg.src = '';
    imgContainer.style.display = 'none';
  }

  modal.classList.remove('hidden'); // Відображаємо модалку на екрані
};

/**
 * 3. Видалення завдання з бази даних + автоматичне чищення файлу зі Storage Supabase
 */
window.deleteHomework = async function(hwId, attachmentUrl) {
  const isConfirmed = confirm("⚠️ Ви впевнені, що хочете видалити це домашнє завдання?\nРобота учня та прикріплений файл зникнуть назавжди.");
  if (!isConfirmed) return;

  try {
    console.log("Запущено процес видалення ДЗ:", hwId);

    // КРОК А: Перевіряємо наявність прикріпленого файлу в сховищі Storage і видаляємо його
    if (attachmentUrl && attachmentUrl !== 'null' && attachmentUrl.includes('/homework-attachments/')) {
      try {
        const urlSegments = attachmentUrl.split('/homework-attachments/');
        if (urlSegments.length > 1) {
          const filePathInStorage = urlSegments[1];
          console.log("Очищення сховища: видаляємо файл", filePathInStorage);
          
          await teacherSupabase
            .storage
            .from('homework-attachments')
            .remove([filePathInStorage]);
        }
      } catch (storageErr) {
        console.error("Попередження сховища (файл міг бути видалений раніше):", storageErr);
      }
    }

    // КРОК Б: Видаляємо запис про ДЗ з таблиці 'homeworks'
    const { error: dbDeleteError } = await teacherSupabase
      .from('homeworks')
      .delete()
      .eq('id', hwId);

    if (dbDeleteError) throw dbDeleteError;

    alert("✅ Завдання успішно видалено з журналу!");

    // Автоматично перерендеримо оновлену таблицю без перезавантаження сторінки
    if (typeof selectedStudentId !== 'undefined' && selectedStudentId) {
      loadTeacherHomeworkJournal(selectedStudentId);
    }

  } catch (error) {
    console.error("Помилка видалення завдання:", error);
    alert(`Помилка під час видалення: ${error.message || error}`);
  }
};

// =========================================================================
// ФУНКЦІЯ ПОВНОГО ВИДАЛЕННЯ ІСТОРІЇ ТА ФАЙЛІВ ДЗ (ТІЛЬКИ ДЛЯ ВЧИТЕЛЯ)
// =========================================================================
async function deleteHomeworkReviewHistory(homeworkId) {
  if (!confirm("⚠️ Ви впевнені, що хочете повністю видалити історію та файл перевірки цього завдання? Цю дію не можна скасувати!")) {
    return;
  }

  try {
    // 1. Видаляємо файл перевірки зі сховища Storage, щоб звільнити місце
    const fileName = `reviews/review_${homeworkId}`;
    await teacherSupabase.storage.from('homework-attachments').remove([fileName]);

    // 2. Скидаємо статус завдання до початкового та очищаємо історію коментарів у базі
    const { error } = await teacherSupabase
      .from('homeworks')
      .update({
        status: 'completed', // повертаємо статус "Здано учнем"
        teacher_comment: null
      })
      .eq('id', homeworkId);

    if (error) throw error;

    alert("🗑️ Історію перевірки успішно видалено з бази!");
    
    // Перезавантажуємо журнал
    if (typeof loadTeacherHomeworkJournal === "function") {
      loadTeacherHomeworkJournal(selectedStudentId);
    }
  } catch (err) {
    console.error("Помилка видалення історії:", err);
    alert(`Не вдалося видалити: ${err.message}`);
  }
}