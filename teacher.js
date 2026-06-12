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
  if (teacherEditorZone) teacherEditorZone.style.display = 'none';

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
// 6. СТВОРЕННЯ ТА НАДСИЛАННЯ НОВОГО ДЗ
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

    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${selectedStudentId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await teacherSupabase
          .storage
          .from('homework-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = teacherSupabase
          .storage
          .from('homework-attachments')
          .getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;

      } catch (storageErr) {
        console.error("Помилка сховища Storage:", storageErr.message);
        alert(`Не вдалося завантажити файл на сервер: ${storageErr.message}`);
        return;
      }
    }

    const { error: dbError } = await teacherSupabase.from('homeworks').insert([
      { 
        student_id: selectedStudentId, 
        title: title, 
        description: desc, 
        deadline: deadline,
        attachment_url: uploadedImageUrl,
        status: 'pending' // Базовий статус
      }
    ]);

    if (!dbError) {
      alert(`Домашнє завдання успішно опубліковано для учня ${selectedStudentName}!`);
      form.reset();
      loadTeacherHomeworkJournal(selectedStudentId); // Одразу оновлюємо журнал під формою!
    } else {
      alert(`Помилка запису в базу даних: ${dbError.message}`);
    }
  });
}

// =========================================================================
// 7. ЖУРНАЛ ЗАДАНИХ ДЗ ЦЬОГО УЧНЯ (НОВЕ)
// =========================================================================
async function loadTeacherHomeworkJournal(studentId) {
  try {
    console.log("Завантажую журнал ДЗ для студента:", studentId);
    
    const { data: homeworks, error } = await teacherSupabase
      .from('homeworks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tbody = document.getElementById('teacher-homework-list-tbody');
    if (!tbody) return;

    if (!homeworks || homeworks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #6b7280; padding: 20px;">
            Ви ще не задавали домашніх завдань цьому учню.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = "";

    homeworks.forEach(hw => {
      const deadlineDate = new Date(hw.deadline).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      let statusBadge = "";
      let actionButton = "";

      // Логіка статусів та кнопок перевірки
      if (hw.status === 'completed') {
        statusBadge = `<span style="background: #def7ec; color: #03543f; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-circle-check"></i> Здано учнем</span>`;
        actionButton = `
          <button type="button" class="manage-btn" style="background: #10b981;" 
                  onclick="openTeacherReviewEditor('${hw.student_response_url}', '${hw.id}')">
            <i class="fa-solid fa-file-signature"></i> Перевірити
          </button>`;
      } else if (hw.status === 'reviewed') {
        statusBadge = `<span style="background: #e1effe; color: #1e429f; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-check-double"></i> Перевірено</span>`;
        // Якщо вже перевірено, даємо можливість завантажити фінальну картинку
        actionButton = `
          <button type="button" class="manage-btn" style="background: #4b5563;"
                  onclick="openTeacherReviewEditor('${hw.student_response_url}', '${hw.id}')">
            <i class="fa-solid fa-eye"></i> Переглянути
          </button>`;
      } else {
        statusBadge = `<span style="background: #fde8e8; color: #9b1c1c; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-clock"></i> Очікує відповіді</span>`;
        actionButton = `<button class="manage-btn" style="background: #9ca3af;" disabled><i class="fa-solid fa-ban"></i> Немає відповіді</button>`;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${hw.title}</td>
        <td>${deadlineDate}</td>
        <td>${statusBadge}</td>
        <td>${actionButton}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Помилка генерації журналу ДЗ:", err);
  }
}

// =========================================================================
// 8. ІНТЕРАКТИВНА ДОШКА ПЕРЕВІРКИ ДЛЯ ВЧИТЕЛЯ (ПОВНА ПРЕМІУМ-ВЕРСІЯ)
// =========================================================================
let isFullscreenActive = false; // Стежимо за станом вікна глобально

window.openTeacherReviewEditor = function(imageUrl, homeworkId) {
  currentReviewHomeworkId = homeworkId;
  const editorZone = document.getElementById('teacher-editor-zone');
  
  if (editorZone) {
    editorZone.style.display = 'block';
    initTeacherCanvas(imageUrl);
    editorZone.scrollIntoView({ behavior: 'smooth' });
  }
};

function initTeacherCanvas(imageUrl) {
  tCanvas = document.getElementById('teacher-canvas');
  if (!tCanvas) return;
  tCtx = tCanvas.getContext('2d');

  tBgImage.src = imageUrl;
  tBgImage.crossOrigin = "anonymous"; 
  
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

  tCanvas.onmousedown = handleTeacherMouseDown;
  tCanvas.onmousemove = handleTeacherMouseMove;
  tCanvas.onmouseup = handleTeacherMouseUp;
  tCanvas.onmouseout = handleTeacherMouseUp;

  setupTeacherToolbarListeners();
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

// ✅ ЗАЛІЗОБЕТОННИЙ ПЕРЕМИКАЧ ПОВНОГО ЕКРАНУ
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
    [brushBtn, textBtn, eraserBtn].forEach(b => b.classList.remove('tool-active'));
    activeBtn.classList.add('tool-active');
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

      let updatePayload = { status: 'reviewed', student_response_url: publicUrl };

      const { error: dbError } = await teacherSupabase
        .from('homeworks')
        .update(updatePayload)
        .eq('id', currentReviewHomeworkId);

      if (dbError && dbError.code === 'PGRST204') {
        const { error: statusOnlyError } = await teacherSupabase
          .from('homeworks')
          .update({ status: 'reviewed' })
          .eq('id', currentReviewHomeworkId);
          
        if (statusOnlyError) throw statusOnlyError;
      } else if (dbError) {
        throw dbError;
      }

      alert("🎉 Завдання успішно перевірено! Учень побачить ваші виправлення.");
      
      const zone = document.getElementById('teacher-editor-zone');
      if (zone) {
        zone.style.display = 'none';
        zone.classList.remove('fullscreen-mode');
      }
      isFullscreenActive = false;

      if (typeof loadTeacherHomeworkJournal === "function") {
        loadTeacherHomeworkJournal(selectedStudentId);
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