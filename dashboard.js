// =========================================================================
// Конфігурація та Ініціалізація
// =========================================================================
const SUPABASE_URL = "https://vagrglarsxjtnsusyonv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK";

const studentSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Дашборд: Клієнт Supabase ініціалізовано!");

let studentCalendar = null; // Глобальна змінна для об'єкта календаря учня

// Глобальні змінні для інтерактивного редактора малювання
let canvas = null;
let ctx = null;
let isDrawing = false;
let currentTool = 'brush'; // 'brush', 'text' або 'eraser'
let lastX = 0;
let lastY = 0;
let bgImage = new Image();

// Нові глобальні змінні для збереження стану та ID
let currentHomeworkId = null; // Сюди запишемо ID поточного завдання
let undoStack = []; // Історія для кроків назад
let redoStack = []; // Історія для кроків вперед
let activeTextarea = null; // Поточне активне поле для введення тексту

// Головні події при завантаженні сторінки
document.addEventListener("DOMContentLoaded", function() {
  loadStudentDashboard();
  initMenuListeners();
  initSaveHomeworkListener(); // Ініціалізуємо кнопку відправки
  initPaymentsTab();          // Ініціалізуємо вкладку оплати
});

// =========================================================================
// 1. Логіка завантаження даних користувача
// =========================================================================
async function loadStudentDashboard() {
  try {
    const { data: { user }, error: authError } = await studentSupabase.auth.getUser();

    if (authError || !user) {
      console.log("Користувач не авторизований. Перенаправлення на вхід...");
      window.location.href = "login.html"; 
      return;
    }

    const { data: profile, error: profileError } = await studentSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Помилка отримання профілю:", profileError.message);
      return;
    }

    if (profile) {
      console.log("Дані учня успішно завантажено:", profile);

      if (profile.role === 'teacher') {
        console.log("Це вчитель! Перенаправлення на сторінку вчителя...");
        window.location.href = "teacher.html";
        return;
      }
      
      const welcomeTitle = document.getElementById('welcome-title');
      if (welcomeTitle) {
          welcomeTitle.innerText = `Welcome back, ${profile.full_name} 👋`;
      }

      const lessonsCounter = document.getElementById('lessons-left-count');
      const hasLessons = profile.lessons_left > 0;
      if (lessonsCounter) {
          lessonsCounter.innerText = profile.lessons_left || 0;
      }

      const unpaidBlock = document.getElementById('block-unpaid');
      const paidBlock = document.getElementById('block-paid');
      
      if (hasLessons) {
        if (unpaidBlock) unpaidBlock.style.display = 'none';
        if (paidBlock) paidBlock.style.display = 'contents';
      } else {
        if (unpaidBlock) unpaidBlock.style.display = 'flex';
        if (paidBlock) paidBlock.style.display = 'none';
      }

      // Синхронізуємо мову навчання з БД у localStorage
      // Пріоритет: Supabase profile > localStorage (якщо є в профілі)
      if (profile.learning_language) {
        localStorage.setItem('novaflow_selected_lang', profile.learning_language);
      }
      
      // Парсимо мову і вибраний курс (якщо він є у форматі 'english:Course Name')
      const rawLang = localStorage.getItem('novaflow_selected_lang') || profile.learning_language || 'english';
      const parts = rawLang.split(':');
      const lang = parts[0];
      const courseName = parts.length > 1 ? parts[1] : null;

      // Перерендерюємо вкладку оплати з правильною мовою та курсом
      renderPaymentsTab(lang, courseName);

      // Запускаємо пошук ДЗ, Уроків та Календаря із мікрозатримкою для стабільності в Opera
      setTimeout(async () => {
        await loadStudentHomework(user.id);
        await loadUpcomingLesson(user.id); 
        await initStudentCalendar(user.id); // Ініціалізація інтерактивного розкладу
      }, 300);

      await handlePaymentReturnFromUrl();
    }
  } catch (err) {
    console.error("Критична помилка дашборду:", err);
  }

}

// =========================================================================
// 2. Логіка автоматичного завантаження найближчого уроку
// =========================================================================
async function loadUpcomingLesson(studentId) {
  try {
    console.log("Шукаю заплановані уроки для ID:", studentId);
    const nowISO = new Date().toISOString();

    const { data: lessons, error } = await studentSupabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .gte('start_time', nowISO)
      .order('start_time', { ascending: true })
      .limit(1);

    if (error) {
      console.error("Помилка при завантаженні розкладу:", error.message);
      return;
    }

    const lessonCard = document.querySelector('.lesson-card.highlight');
    if (!lessonCard) {
      console.warn("Попередження: Елемент класу '.lesson-card.highlight' не знадено в HTML!");
      return;
    }

    if (lessons && lessons.length > 0) {
      const nextLesson = lessons[0];
      
      const dateObj = new Date(nextLesson.start_time);
      const options = { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' };
      let formattedDate = dateObj.toLocaleDateString('uk-UA', options);
      
      formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

      lessonCard.innerHTML = `
        <span class="card-tag" style="background: #10b981;">Наступний урок</span>
        <h2 style="margin: 10px 0; font-size: 1.5rem;">${formattedDate.replace(' о ', ' — ')}</h2>
        <p style="margin-bottom: 15px;"><i class="fa-solid fa-user-tie"></i> Викладач: Кирило 👨‍🏫</p>
        <a href="https://zoom.us" target="_blank" class="dash-btn btn-success"><i class="fa-solid fa-video"></i> Join Lesson</a>
      `;
    } else {
      lessonCard.innerHTML = `
        <span class="card-tag" style="background: #6b7280;">Уроків немає</span>
        <h2 style="margin: 10px 0; font-size: 1.3rem; color: #374151;">Розклад не заплановано</h2>
        <p style="margin-bottom: 15px; color: #6b7280;">Твій викладач ще не призначив наступне заняття.</p>
        <button class="dash-btn btn-outline" disabled><i class="fa-solid fa-calendar-xmark"></i> Очікування</button>
      `;
    }
  } catch (err) {
    console.error("Помилка виконання функції loadUpcomingLesson:", err);
  }
}

// =========================================================================
// 3. Логіка генерації календаря у вкладці "Заняття"
// =========================================================================
async function initStudentCalendar(studentId) {
  try {
    const calendarEl = document.getElementById('student-calendar-element');
    if (!calendarEl) return;

    const { data: DB_Lessons, error } = await studentSupabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error("Помилка завантаження розкладу для календаря:", error.message);
      return;
    }

    const formattedEvents = (DB_Lessons || []).map(lesson => ({
      id: lesson.id,
      title: `Урок з Кирилом 👨‍🏫`,
      start: lesson.start_time,
      end: lesson.end_time,
      backgroundColor: '#a855f7',
      borderColor: '#9333ea',
      textColor: '#ffffff'
    }));

    studentCalendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      locale: 'uk',
      firstDay: 1, 
      slotMinTime: '08:00:00',
      slotMaxTime: '22:00:00',
      allDaySlot: false,
      height: 'auto',
      expandRows: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridWeek,timeGridDay'
      },
      editable: false, 
      selectable: false, 
      events: formattedEvents,
      eventClick: function(info) {
        alert(`📌 Заплановане заняття:\nТема: ${info.event.title}\nЧас початку: ${info.event.start.toLocaleString('uk-UA')}`);
      }
    });

    studentCalendar.render();
  } catch (err) {
    console.error("Помилка при ініціалізації календаря учня:", err);
  }
}

async function loadStudentHomework(studentId) {
  try {
    console.log("Запитую ДЗ з бази для ID:", studentId);

    const { data: homeworks, error } = await studentSupabase
      .from('homeworks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Помилка при отримання ДЗ з бази:", error.message);
      return;
    }

    const homeworkTitle = document.getElementById('homework-title');
    const homeworkDesc = document.getElementById('homework-desc');
    const homeworkDeadline = document.getElementById('homework-deadline');

    const tabTitle = document.getElementById('tab-homework-title');
    const tabDesc = document.getElementById('tab-homework-desc');
    const tabDeadline = document.getElementById('tab-homework-deadline');
    const editorZone = document.getElementById('homework-editor-zone');
    const actionBlock = document.getElementById('tab-homework-action-block');

    if (homeworks && homeworks.length > 0) {
      const latestHomework = homeworks[0];
      currentHomeworkId = latestHomework.id; 

      const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      const formattedDeadline = new Date(latestHomework.deadline).toLocaleString('uk-UA', dateOptions);

      if (homeworkTitle) homeworkTitle.innerText = latestHomework.title;
      if (homeworkDesc) homeworkDesc.innerText = latestHomework.description || "Опис відсутній";
      if (homeworkDeadline) homeworkDeadline.innerHTML = `<i class="fa-solid fa-clock"></i> Дедлайн: ${formattedDeadline}`;

      if (tabTitle) tabTitle.innerText = latestHomework.title;
      if (tabDesc) tabDesc.innerText = latestHomework.description || "Опис відсутній";
      if (tabDeadline) tabDeadline.innerText = `Здати до: ${formattedDeadline}`;

      const statusBadge = document.getElementById('homework-status-badge');
      const actionBtn = document.getElementById('homework-action-btn');
      
      if (statusBadge && actionBtn) {
        if (latestHomework.status === 'completed') {
          statusBadge.className = 'status-badge success';
          statusBadge.style.backgroundColor = '#def7ec';
          statusBadge.style.color = '#03543f';
          statusBadge.innerHTML = '<i class="fa-solid fa-check"></i> Виконано';
          actionBtn.innerText = 'Переглянути відповідь';
        } else if (latestHomework.status === 'reviewed') {
          statusBadge.className = 'status-badge info';
          statusBadge.style.backgroundColor = '#e1effe';
          statusBadge.style.color = '#1e429f';
          statusBadge.innerHTML = '<i class="fa-solid fa-check-double"></i> Перевірено';
          actionBtn.innerText = 'Переглянути відгук';
        } else {
          statusBadge.className = 'status-badge warning';
          statusBadge.style.backgroundColor = '#fdf6b2';
          statusBadge.style.color = '#723b13';
          statusBadge.innerHTML = 'Очікує виконання';
          actionBtn.innerText = 'Перейти до ДЗ';
        }
      }

      // Обчислюємо посилання на фото
      let urlToLoad = null;
      if (latestHomework.student_response_url && latestHomework.student_response_url !== 'null') {
        urlToLoad = latestHomework.student_response_url;
      } else if (latestHomework.attachment_url && latestHomework.attachment_url !== 'null') {
        urlToLoad = latestHomework.attachment_url;
      }

      // ФІКС: За замовчуванням приховуємо дошку малювання, щоб вона не відкривалась автоматично
      if (editorZone) {
        editorZone.classList.add('hidden');
        editorZone.style.display = 'none';
      }

      if (urlToLoad && urlToLoad.trim() !== '') {
        if (actionBlock) actionBlock.style.display = 'block'; // показуємо блок керування
        initHomeworkCanvas(urlToLoad);
      } else {
        if (actionBlock) actionBlock.style.display = 'none';
      }

    } else {
      if (homeworkTitle) homeworkTitle.innerText = "Активних завдань немає";
      if (homeworkDesc) homeworkDesc.innerText = "Вчитель ще не додав для тебе домашнього завдання.";
      if (homeworkDeadline) homeworkDeadline.innerText = "";
      if (editorZone) {
        editorZone.classList.add('hidden');
        editorZone.style.display = 'none';
      }
      if (actionBlock) actionBlock.style.display = 'none';
    }

    // Будуємо історію ДЗ у таблиці
    const tbody = document.getElementById('student-homework-history-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      if (!homeworks || homeworks.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="table-empty-row" style="text-align: center; padding: 20px; color: #6b7280;">
              У вас поки немає заданих домашніх завдань.
            </td>
          </tr>`;
      } else {
        homeworks.forEach(hw => {
          const deadlineDate = new Date(hw.deadline).toLocaleString('uk-UA', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          let statusBadge = '';
          if (hw.status === 'completed' || hw.status === 'done') {
            statusBadge = `<span style="background: #def7ec; color: #03543f; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-circle-check"></i> Здано</span>`;
          } else if (hw.status === 'reviewed') {
            statusBadge = `<span style="background: #e1effe; color: #1e429f; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-check-double"></i> Перевірено</span>`;
          } else {
            statusBadge = `<span style="background: #fde8e8; color: #9b1c1c; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;"><i class="fa-solid fa-clock"></i> Очікує</span>`;
          }

          let actionButtons = '';
          const b64Hw = btoa(unescape(encodeURIComponent(JSON.stringify(hw))));

          // Кнопка перегляду перевірки (якщо статус reviewed або completed і є student_response_url)
          if (hw.student_response_url && hw.student_response_url !== 'null' && hw.student_response_url !== 'undefined') {
            actionButtons += `
              <button type="button" class="dash-btn btn-success" style="background: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;" 
                      onclick="window.displayReviewedHwFromBase64('${b64Hw}')">
                <i class="fa-solid fa-eye"></i> Перевірка
              </button>`;
          }

          // Кнопка для відкриття ДЗ у верхньому блоці для виконання
          actionButtons += `
            <button type="button" class="dash-btn" style="background: #6366f1; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 4px;" 
                    onclick="window.selectHwFromBase64('${b64Hw}')">
              <i class="fa-solid fa-file-signature"></i> Відкрити ДЗ
            </button>`;

          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-weight: 600; padding: 12px 8px;">${hw.title}</td>
            <td style="padding: 12px 8px;">${deadlineDate}</td>
            <td style="padding: 12px 8px;">${statusBadge}</td>
            <td style="white-space: nowrap; padding: 12px 8px;">${actionButtons}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }

  } catch (err) {
    console.error("Помилка виконання функції loadStudentHomework:", err);
  }
}

// =========================================================================
// 4.1 Логіка роботи Canvas (Пензель, Живий Текст, Стерка, Стрілочки, Fullscreen)
// =========================================================================
function initHomeworkCanvas(imageUrl) {
  canvas = document.getElementById('homework-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  console.log("Ініціалізація Canvas. Завантажую фон...");

  // ФІКС CORS: Налаштування заголовків безпеки строго ДО вказання джерела src!
  bgImage.crossOrigin = "anonymous"; 
  bgImage.src = imageUrl;
  
  bgImage.onload = function() {
    console.log("Фонове зображення успішно завантажено в Canvas.");
    const maxWidth = 850;
    canvas.width = bgImage.width > maxWidth ? maxWidth : bgImage.width;
    const scale = canvas.width / bgImage.width;
    canvas.height = bgImage.height * scale;

    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Очищаємо стеки при завантаженні нового завдання
    undoStack = [];
    redoStack = [];
    // Зберігаємо початковий стан (чистий фон) в історію
    saveState();
  };

  bgImage.onerror = function(err) {
    console.error("Критична помилка завантаження фонового зображення в Canvas. Можливо, проблема CORS або файл видалено.", err);
  };

  // Події миші
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseout', handleMouseUp);

  // Тач-події для мобільних
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      if (currentTool === 'text') return; // Даємо сфокусуватися мобільній клавіатурі
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
      canvas.dispatchEvent(mouseEvent);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDrawing) {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
      canvas.dispatchEvent(mouseEvent);
    }
  }, { passive: false });
  
  canvas.addEventListener('touchend', () => {
    canvas.dispatchEvent(new MouseEvent('mouseup', {}));
  });

  setupToolbarListeners();
}

// Збереження знімку екрана для Undo/Redo
function saveState() {
  if (undoStack.length > 20) undoStack.shift();
  undoStack.push(canvas.toDataURL());
  redoStack = []; // Коли створюємо нову дію, очищаємо "Крок вперед"
}

function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Якщо вже є відкрите поле тексту, і ми клікаємо в іншому місці — спочатку запікаємо його
  if (activeTextarea) {
    finalizeLiveText();
    return;
  }

  // ЛОГІКА ДЛЯ ІНСТРУМЕНТУ "ТЕКСТ" (ЖИВИЙ РЕДАКТОР)
  if (currentTool === 'text') {
    const size = document.getElementById('editor-size').value;
    const color = document.getElementById('editor-color').value;
    const fontSize = parseInt(size) * 2 + 14; // Розрахунок адекватного розміру шрифту

    // Створюємо динамічний HTML-елемент textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'canvas-live-textarea';
    
    // Позиціонуємо елемент точно в місце кліку всередині canvas-wrapper
    textarea.style.left = `${x}px`;
    textarea.style.top = `${y}px`;
    textarea.style.fontSize = `${fontSize}px`;
    textarea.style.color = color;
    textarea.style.height = `${fontSize * 1.4}px`;
    textarea.style.width = '160px'; // Початкова базова ширина

    // Зберігаємо координати кліку в кастомні атрибути, щоб потім відмалювати на Canvas
    textarea.dataset.canvasX = x.toString();
    textarea.dataset.canvasY = y.toString();

    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.appendChild(textarea);
    
    // Автофокусуємося, щоб учень міг одразу вводити текст
    setTimeout(() => textarea.focus(), 10);

    // Авто-підлаштування ширини textarea під об'єм введеного тексту
    textarea.addEventListener('input', () => {
      textarea.style.width = 'auto';
      textarea.style.width = `${textarea.scrollWidth + 20}px`;
    });

    // Запікання по натисканню Enter (якщо не затиснутий Shift для переносу)
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        finalizeLiveText();
      }
    });

    activeTextarea = textarea;
    return;
  }

  // Логіка для пензля або стерки
  isDrawing = true;
  lastX = x;
  lastY = y;
}

// Функція фіксації тексту та його перенесення безпосередньо на Canvas
function finalizeLiveText() {
  if (!activeTextarea) return;

  const text = activeTextarea.value.trim();
  if (text !== "") {
    const x = parseFloat(activeTextarea.dataset.canvasX);
    const y = parseFloat(activeTextarea.dataset.canvasY);
    const fontSize = parseFloat(activeTextarea.style.fontSize);
    const color = activeTextarea.style.color;

    // Малюємо текст на Canvas
    ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);

    saveState(); // Рятуємо стан в історію для Undo
  }

  // Видаляємо інтерактивне вікно з DOM дерева
  activeTextarea.remove();
  activeTextarea = null;
}

function handleMouseMove(e) {
  if (!isDrawing || currentTool === 'text') return;
  
  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);

  const size = document.getElementById('editor-size').value;

  if (currentTool === 'eraser') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(currentX, currentY, size * 1.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  } else {
    ctx.strokeStyle = document.getElementById('editor-color').value;
    ctx.lineWidth = size;
    ctx.stroke();
  }

  lastX = currentX;
  lastY = currentY;
}

function handleMouseUp() {
  if (isDrawing) {
    isDrawing = false;
    saveState(); // Завершили малювати лінію — зберегли стан
  }
}

// Функція кроку НАЗАД (Undo)
function undo() {
  if (activeTextarea) finalizeLiveText(); // Якщо є незакритий текст — закриваємо
  
  if (undoStack.length > 1) { 
    redoStack.push(undoStack.pop());
    const prevStateData = undoStack[undoStack.length - 1];
    restoreCanvasState(prevStateData);
  }
}

// Функція кроку ВПЕРЕД (Redo)
function redo() {
  if (activeTextarea) finalizeLiveText();
  
  if (redoStack.length > 0) {
    const nextStateData = redoStack.pop();
    undoStack.push(nextStateData);
    restoreCanvasState(nextStateData);
  }
}

function restoreCanvasState(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  img.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
}

// Налаштування кнопок тулбару
function setupToolbarListeners() {
  const brushBtn = document.getElementById('tool-brush');
  const textBtn = document.getElementById('tool-text');
  const eraserBtn = document.getElementById('tool-eraser');
  const undoBtn = document.getElementById('tool-undo');
  const redoBtn = document.getElementById('tool-redo');
  const clearBtn = document.getElementById('tool-clear');
  const fullscreenBtn = document.getElementById('btn-fullscreen');
  const fullscreenCloseBtn = document.getElementById('btn-fullscreen-close'); // Плаваючий хрестик

  if (brushBtn && textBtn && eraserBtn) {
    brushBtn.onclick = () => { if (activeTextarea) finalizeLiveText(); currentTool = 'brush'; setActiveTool(brushBtn); };
    textBtn.onclick = () => { currentTool = 'text'; setActiveTool(textBtn); };
    eraserBtn.onclick = () => { if (activeTextarea) finalizeLiveText(); currentTool = 'eraser'; setActiveTool(eraserBtn); };
  }

  function setActiveTool(activeBtn) {
    [brushBtn, textBtn, eraserBtn].forEach(b => b.classList.remove('tool-active'));
    activeBtn.classList.add('tool-active');
  }

  // Навішуємо стрілочки скасування дій
  if (undoBtn) undoBtn.onclick = undo;
  if (redoBtn) redoBtn.onclick = redo;

  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm("Очистити всі записи на сторінці?")) {
        if (activeTextarea) {
          activeTextarea.remove();
          activeTextarea = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        saveState();
      }
    };
  }

  // КНОПКА ПОВНОГО ЕКРАНУ
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const editorZone = document.getElementById('homework-editor-zone');
      if (!editorZone) return;
      
      editorZone.classList.toggle('fullscreen-mode');
      
      if (editorZone.classList.contains('fullscreen-mode')) {
        fullscreenBtn.innerHTML = `<i class="fa-solid fa-compress"></i> Згорнути`;
      } else {
        fullscreenBtn.innerHTML = `<i class="fa-solid fa-expand"></i> Повний екран`;
      }
    };
  }

  // ПЛАВАЮЧА КНОПКА-ХРЕСТИК ДЛЯ ВИХОДУ З ФУЛСКРІНУ
  if (fullscreenCloseBtn) {
    fullscreenCloseBtn.onclick = () => {
      const editorZone = document.getElementById('homework-editor-zone');
      if (editorZone) {
        editorZone.classList.remove('fullscreen-mode');
        if (fullscreenBtn) fullscreenBtn.innerHTML = `<i class="fa-solid fa-expand"></i> Повний екран`;
      }
    };
  }
}
// =========================================================================
// 4.2 НАДСИЛАННЯ ТА ЗБЕРЕЖЕННЯ ДЗ У ХМАРУ SUPABASE STORAGE
// =========================================================================
function initSaveHomeworkListener() {
  const saveBtn = document.getElementById('btn-save-homework-result');
  if (!saveBtn) return;

  saveBtn.onclick = async function() {
    if (activeTextarea) finalizeLiveText(); // Якщо текст не зафіксований — запікаємо його перед відправкою

    if (!currentHomeworkId) {
      alert("Помилка: Не знайдено ID поточного домашнього завдання!");
      return;
    }

    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Надсилаю у хмару...`;

    try {
      // 1. Отримуємо знімок Canvas у вигляді Blob файлу
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Не вдалося сформувати файл із зображення.");

      // 2. Створюємо шлях у бакеті: results/ID_ДЗ_час.png
      const fileName = `results/${currentHomeworkId}_${Date.now()}.png`;

      // 3. Завантажуємо файл у Supabase Storage (з параметром upsert для перезапису)
      const { data: uploadData, error: uploadError } = await studentSupabase
        .storage
        .from('homework-attachments')
        .upload(fileName, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      // 4. Генеруємо пряме публічне URL-посилання на завантажений файл
      const { data: { publicUrl } } = studentSupabase
        .storage
        .from('homework-attachments')
        .getPublicUrl(fileName);

      // 5. Оновлюємо таблицю homeworks (міняємо статус та записуємо лінк-відповідь)
      const { error: dbError } = await studentSupabase
        .from('homeworks')
        .update({
          status: 'completed',
          student_response_url: publicUrl,
          updated_at: new Date()
        })
        .eq('id', currentHomeworkId);

      if (dbError) throw dbError;

      alert("🎉 Роботу успішно збережено та надіслано вчителю Кирилу!");
      
      // Автоматично виходимо з повноекранного режиму після успішної здачі
      const editorZone = document.getElementById('homework-editor-zone');
      if (editorZone) editorZone.classList.remove('fullscreen-mode');

    } catch (err) {
      console.error("Помилка при збереженні роботи учня:", err);
      alert(`Не вдалося надіслати ДЗ: ${err.message}`);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  };
}

// =========================================================================
// 5. ГЛОБАЛЬНА ФУНКЦІЯ ПЕРЕМИКАННЯ ВКЛАДОК
// =========================================================================
window.switchTab = function(tabName) {
  const lessonsLeftCount = parseInt(document.getElementById('lessons-left-count')?.textContent || '0', 10);
  const isLockedTab = ['lessons', 'homework', 'materials'].includes(tabName);
  
  if (lessonsLeftCount === 0 && isLockedTab) {
    alert("Оплати курс, щоб розблокувати цей розділ!");
    tabName = 'payments'; // Перенаправляємо на оплату
  }

  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.style.display = 'none';
    tab.classList.remove('active');
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) {
    activeTab.style.display = 'block'; 
    activeTab.classList.add('active');
  }

  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
  });

  const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  if (tabName === 'lessons' && studentCalendar) {
    setTimeout(() => {
      studentCalendar.updateSize();
      console.log("Розмір календаря учня адаптовано.");
    }, 50);
  }
};

// =========================================================================
// 6. Навішування подій (Слухачі меню)
// =========================================================================
function initMenuListeners() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tabName = link.getAttribute('data-tab');
      if (tabName) window.switchTab(tabName);
    });
  });

  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm("Ти дійсно хочеш вийти з особистого кабінету?")) {
        await studentSupabase.auth.signOut();
        localStorage.clear();
        window.location.href = "login.html"; 
      }
    });
  }
}

// =========================================================================
// 7. ВКЛАДКА ОПЛАТИ — Тарифні плани з прив'язкою до мови учня
// =========================================================================

const COURSES = {
  english: [
    { id: 'en-beginners', name: 'For Beginners (A1-A2)', pricePerLesson: 12, desc: 'Perfect for beginners who want to build a strong foundation in English and start speaking confidently.' },
    { id: 'en-comm', name: 'English for Communication', pricePerLesson: 12, desc: 'Focus on real-life communication and improve your confidence in everyday conversations.' },
    { id: 'en-business', name: 'Career & Business English', pricePerLesson: 15, desc: 'Develop professional communication skills for work, meetings, and international business.' },
    { id: 'en-exam', name: 'Exam & Test Preparation', pricePerLesson: 18, desc: 'Get fully prepared for IELTS, TOEFL, or Cambridge exams with targeted strategies and practice tests.' }
  ],
  german: [
    { id: 'de-beginners', name: 'Deutsch für Anfänger (A1-A2)', pricePerLesson: 12, desc: 'Perfect for beginners who want to build a strong foundation.' },
    { id: 'de-comm', name: 'Deutsch für Kommunikation', pricePerLesson: 12, desc: 'Focus on real-life communication.' },
    { id: 'de-business', name: 'Geschäftsdeutsch', pricePerLesson: 15, desc: 'Develop professional communication skills for work.' },
    { id: 'de-exam', name: 'Goethe/TestDaF Vorbereitung', pricePerLesson: 18, desc: 'Get fully prepared for exams.' }
  ],
  ukrainian: [
    { id: 'uk-beginners', name: 'Українська для початківців', pricePerLesson: 12, desc: 'Основи мови та базові конструкції.' },
    { id: 'uk-comm', name: 'Українська для спілкування', pricePerLesson: 12, desc: 'Розмовна практика для повсякденного життя.' },
    { id: 'uk-business', name: 'Ділова українська мова', pricePerLesson: 15, desc: 'Для роботи, офіційних зустрічей та бізнесу.' }
  ]
};

const LANG_CONFIG = {
  english:   { flag: '🇬🇧', label: 'Англійська мова', color: '#0057b7', gradient: 'linear-gradient(135deg, #0057b722, #0057b711)' },
  german:    { flag: '🇩🇪', label: 'Німецька мова',   color: '#DD0000', gradient: 'linear-gradient(135deg, #DD000022, #DD000011)' },
  ukrainian: { flag: '🇺🇦', label: 'Українська мова', color: '#FFD700', gradient: 'linear-gradient(135deg, #0057B722, #FFD70022)' }
};

function initPaymentsTab() {
  // Читаємо мову з localStorage
  const rawLang = localStorage.getItem('novaflow_selected_lang') || 'english';
  const parts = rawLang.split(':');
  const lang = parts[0];
  const courseName = parts.length > 1 ? parts[1] : null;
  renderPaymentsTab(lang, courseName);
}

async function renderPaymentsTab(lang, currentCourseName) {
  const cfg = LANG_CONFIG[lang] || LANG_CONFIG.english;

  // --- Банер ---
  const banner = document.getElementById('payments-lang-banner');
  const iconEl = document.getElementById('payments-lang-icon');
  const titleEl = document.getElementById('payments-lang-title');
  const descEl = document.getElementById('payments-lang-desc');
  const lessonsCountEl = document.getElementById('payments-lessons-count');
  const sectionDescEl = document.getElementById('payments-section-desc');

  if (iconEl) iconEl.textContent = cfg.flag;
  if (titleEl) titleEl.textContent = `Ти вивчаєш: ${cfg.label}`;
  if (descEl) descEl.textContent = 'Обери план та продовж свій мовний шлях з NovaFlow';
  if (sectionDescEl) sectionDescEl.textContent = `Плани для курсу ${cfg.label}`;

  if (banner) {
    banner.style.background = cfg.gradient;
    banner.style.borderLeft = `4px solid ${cfg.color}`;
  }

  // Завантажуємо актуальний баланс уроків з Supabase
  try {
    const { data: { user } } = await studentSupabase.auth.getUser();
    if (user) {
      const { data: profile } = await studentSupabase
        .from('profiles').select('lessons_left').eq('id', user.id).single();
      if (profile && lessonsCountEl) {
        lessonsCountEl.textContent = profile.lessons_left || 0;
      }
    }
  } catch (e) {
    if (lessonsCountEl) lessonsCountEl.textContent = '—';
  }

  // --- Рендер карток планів ---
  const grid = document.getElementById('dash-pricing-grid');
  if (!grid) return;

  if (currentCourseName) {
    const courseList = COURSES[lang] || COURSES.english;
    const course = courseList.find(c => c.name === currentCourseName) || courseList[0];
    
    grid.innerHTML = `
      <div class="dash-plan-card dash-plan-popular" style="width: 100%; max-width: 600px; margin: 0 auto; grid-column: 1 / -1;">
        <span class="dash-plan-badge">Твій поточний курс</span>
        <div class="dash-plan-header">
          <h3 class="dash-plan-name">${course.name}</h3>
          <p class="dash-plan-lessons-tag" style="margin-top: 10px;">${course.desc}</p>
        </div>
        
        <div style="padding: 20px 0;">
          <label style="display: block; margin-bottom: 10px; font-weight: 600;">Обери кількість уроків:</label>
          <input type="range" id="lesson-slider" min="1" max="20" value="10" style="width: 100%;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #6b7280; margin-top: 5px;">
            <span>1</span>
            <span>10 (Знижка)</span>
            <span>20</span>
          </div>
          
          <div style="margin-top: 20px; font-size: 1.2rem; font-weight: bold; text-align: center;">
             Кількість: <span id="lesson-count-display" style="color: #4B1F60; font-size: 1.5rem;">10</span> уроків
          </div>
          <div style="margin-top: 5px; font-size: 1.2rem; font-weight: bold; text-align: center;">
             До сплати: <span id="total-price-display" style="color: #10b981; font-size: 1.5rem;">$${(course.pricePerLesson - 1) * 10}</span>
          </div>
          <div id="discount-msg" style="text-align: center; color: #f59e0b; font-size: 0.9rem; margin-top: 5px;">
             🎉 Застосовано знижку $1 за урок!
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="dash-plan-btn dash-plan-btn-paid" id="btn-buy-course" style="flex: 1;">💳 Оплатити</button>
          <button class="dash-btn btn-outline" id="btn-change-course" style="flex: 1;">Змінити курс</button>
        </div>
      </div>
    `;

    const slider = document.getElementById('lesson-slider');
    const countDisplay = document.getElementById('lesson-count-display');
    const priceDisplay = document.getElementById('total-price-display');
    const discountMsg = document.getElementById('discount-msg');
    const buyBtn = document.getElementById('btn-buy-course');
    const changeBtn = document.getElementById('btn-change-course');

    slider.addEventListener('input', (e) => {
      const count = parseInt(e.target.value, 10);
      countDisplay.innerText = count;
      
      let price = course.pricePerLesson;
      if (count >= 10) {
        price = price - 1;
        discountMsg.style.visibility = 'visible';
      } else {
        discountMsg.style.visibility = 'hidden';
      }
      
      const total = price * count;
      priceDisplay.innerText = `$${total}`;
    });

    buyBtn.addEventListener('click', async () => {
      const count = parseInt(slider.value, 10);
      let price = course.pricePerLesson;
      if (count >= 10) price = price - 1;
      const total = price * count;

      try {
        const { data: { user } } = await studentSupabase.auth.getUser();
        await studentSupabase.from('profiles').update({ learning_language: `${lang}:${course.name}` }).eq('id', user.id);
        localStorage.setItem('novaflow_selected_lang', `${lang}:${course.name}`);
      } catch(e) { console.error(e); }

      handleDashboardPurchase(course.name, total, count, buyBtn, lang);
    });

    changeBtn.addEventListener('click', () => {
      renderPaymentsTab(lang, null);
    });

  } else {
    const courseList = COURSES[lang] || COURSES.english;
    
    grid.innerHTML = courseList.map(course => `
      <div class="dash-plan-card">
        <div class="dash-plan-header">
          <h3 class="dash-plan-name">${course.name}</h3>
          <div class="dash-plan-price-wrap">
            <span class="dash-plan-price">$${course.pricePerLesson}</span>
            <span class="dash-plan-period">/ урок</span>
          </div>
          <p class="dash-plan-lessons-tag" style="margin-top: 10px;">
            ${course.desc}
          </p>
        </div>
        <button class="dash-plan-btn dash-plan-btn-paid" data-course-name="${course.name}" style="margin-top: auto;">
          Обрати цей курс
        </button>
      </div>
    `).join('');

    grid.querySelectorAll('.dash-plan-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const selectedName = btn.getAttribute('data-course-name');
        
        try {
          const { data: { user } } = await studentSupabase.auth.getUser();
          if (user) {
             await studentSupabase.from('profiles').update({ learning_language: `${lang}:${selectedName}` }).eq('id', user.id);
             localStorage.setItem('novaflow_selected_lang', `${lang}:${selectedName}`);
          }
        } catch(e) { console.error(e); }

        renderPaymentsTab(lang, selectedName);
      });
    });
  }
}

const PURCHASE_BTN_SPINNER = `<span class="dash-plan-btn-spinner" aria-hidden="true"></span> Обробка...`;

function setCheckoutOverlayVisible(visible) {
  const overlay = document.getElementById('checkout-overlay');
  if (!overlay) return;
  overlay.classList.toggle('checkout-overlay--visible', visible);
  overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
}

async function refreshLessonsBalanceFromProfile() {
  const { data: { user } } = await studentSupabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await studentSupabase
    .from('profiles')
    .select('lessons_left')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Не вдалося оновити баланс:', error.message);
    return null;
  }

  const count = profile?.lessons_left ?? 0;
  const lessonsCounter = document.getElementById('lessons-left-count');
  if (lessonsCounter) lessonsCounter.textContent = count;
  const paymentsCounter = document.getElementById('payments-lessons-count');
  if (paymentsCounter) paymentsCounter.textContent = count;
  return count;
}

async function handlePaymentReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') !== 'success') return;

  const isMock = params.get('mock') === 'true';

  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete('payment');
  cleanUrl.searchParams.delete('mock');
  const nextPath = cleanUrl.pathname + cleanUrl.search + cleanUrl.hash;
  window.history.replaceState({}, '', nextPath || cleanUrl.pathname);

  if (typeof window.switchTab === 'function') {
    window.switchTab('payments');
  }

  await refreshLessonsBalanceFromProfile();
  showPaymentSuccessToast(isMock);
}

async function handleDashboardPurchase(planName, price, lessonsCount, btn, lang) {
  const originalHTML = btn ? btn.innerHTML : '';

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = PURCHASE_BTN_SPINNER;
  }
  setCheckoutOverlayVisible(true);

  try {
    const { data: { session }, error: sessionError } = await studentSupabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      throw new Error('Не авторизований');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        planName,
        price,
        lessonsCount,
        lang: lang || localStorage.getItem('novaflow_selected_lang') || 'english',
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || payload.message || `Помилка сервера (${response.status})`);
    }

    const checkoutUrl = payload.url || payload.session?.url;
    if (!checkoutUrl) {
      throw new Error('Сервер не повернув URL оплати');
    }

    window.location.href = checkoutUrl;
  } catch (err) {
    console.error('Помилка checkout:', err.message);
    setCheckoutOverlayVisible(false);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
    showDashToast('❌ Не вдалося розпочати оплату. Спробуй ще раз.', '#ef4444');
  }
}

function showPaymentSuccessToast(isMock = false) {
  const existing = document.getElementById('dash-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'dash-toast';
  toast.className = 'dash-toast dash-toast--success';
  toast.innerHTML = `
    <div class="dash-toast-icon" aria-hidden="true">✓</div>
    <div class="dash-toast-body">
      <strong>Оплату підтверджено!</strong>
      <span>${isMock ? 'Тестова оплата пройшла успішно. Баланс оновлено локально.' : 'Баланс уроків оновлено. Дякуємо, що обрав NovaFlow.'}</span>
    </div>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('dash-toast--visible'));

  setTimeout(() => {
    toast.classList.remove('dash-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function showDashToast(message, color = '#4B1F60') {
  const existing = document.getElementById('dash-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'dash-toast';
  toast.style.cssText = `
    position: fixed; bottom: 30px; right: 30px; z-index: 9999;
    background: ${color}; color: white;
    padding: 14px 22px; border-radius: 14px;
    font-size: 15px; font-weight: 600;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    transform: translateY(20px); opacity: 0;
    transition: all 0.35s cubic-bezier(.34,1.56,.64,1);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}
// =========================================================================
// ВІДОБРАЖЕННЯ ПЕРЕВІРЕНОГО ЗАВДАННЯ ТА ІСТОРІЇ ДЗ У КАБІНЕТІ УЧНЯ
// =========================================================================
function displayStudentReviewedHomework(homework) {
  // 1. Знаходимо або створюємо контейнер для історії коментарів у модалці/зоні учня
  const previewZone = document.getElementById('student-review-zone'); 
  if (!previewZone) return;

  // Показуємо зону перегляду
  previewZone.style.display = 'block';

  // 2. Виведення картинки з хвостиком проти кешування (щоб завжди завантажувався свіжий малюнок)
  const studentCanvasImg = document.getElementById('student-reviewed-image');
  if (studentCanvasImg && homework.student_response_url) {
    studentCanvasImg.src = `${homework.student_response_url}?t=${Date.now()}`;
  }

  // 3. ЛОГІКА ІСТОРІЇ: Шукаємо або створюємо блок для відображення історії переписки
  let commentContainer = document.getElementById('student-hw-history-box');
  
  if (!commentContainer) {
    // Якщо блоку ще немає в HTML, створюємо його динамічно під картинкою
    commentContainer = document.createElement('div');
    commentContainer.id = 'student-hw-history-box';
    // Додаємо гарні стилі для історії (сірий блок, схожий на чат)
    commentContainer.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background-color: #f3f4f6;
      border-left: 4px solid #6366f1;
      border-radius: 6px;
      white-space: pre-line;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.95rem;
      color: #1f2937;
      max-height: 250px;
      overflow-y: auto;
    `;
    previewZone.appendChild(commentContainer);
  }

  // 4. Заповнюємо блок історією або пишемо, що коментарів немає
  if (homework.teacher_comment && homework.teacher_comment.trim() !== "") {
    commentContainer.innerHTML = `
      <h4 style="margin-top:0; margin-bottom:10px; color:#4f46e5; font-size:1.1rem;">
        <i class="fa-solid fa-clock-history"></i> Історія перевірки та коментарів:
      </h4>
      ${homework.teacher_comment}
    `;
  } else {
    commentContainer.innerHTML = `
      <p style="color: #6b7280; font-style: italic; margin: 0;">
        <i class="fa-solid fa-comment-slash"></i> Текстових коментарів до цього завдання поки немає.
      </p>
    `;
  }

  // Плавний скрол до блоку результатів
  previewZone.scrollIntoView({ behavior: 'smooth' });
}

window.displayStudentReviewedHomework = displayStudentReviewedHomework;

window.displayReviewedHwFromBase64 = function(b64Data) {
  try {
    const hw = JSON.parse(decodeURIComponent(escape(atob(b64Data))));
    displayStudentReviewedHomework(hw);
  } catch (err) {
    console.error("Помилка декодування ДЗ для перегляду:", err);
  }
};

window.selectHwFromBase64 = function(b64Data) {
  try {
    const hw = JSON.parse(decodeURIComponent(escape(atob(b64Data))));
    window.selectHomeworkForSolving(hw);
  } catch (err) {
    console.error("Помилка декодування ДЗ для виконання:", err);
  }
};

window.selectHomeworkForSolving = function(homework) {
  currentHomeworkId = homework.id;
  
  const tabTitle = document.getElementById('tab-homework-title');
  const tabDesc = document.getElementById('tab-homework-desc');
  const tabDeadline = document.getElementById('tab-homework-deadline');
  const editorZone = document.getElementById('homework-editor-zone');
  const actionBlock = document.getElementById('tab-homework-action-block');

  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formattedDeadline = new Date(homework.deadline).toLocaleString('uk-UA', dateOptions);

  if (tabTitle) tabTitle.innerText = homework.title;
  if (tabDesc) tabDesc.innerText = homework.description || "Опис відсутній";
  if (tabDeadline) tabDeadline.innerText = `Здати до: ${formattedDeadline}`;

  // Скидаємо/приховуємо саму дошку малювання за замовчуванням
  if (editorZone) {
    editorZone.classList.add('hidden');
    editorZone.style.display = 'none';
  }

  let urlToLoad = null;
  if (homework.student_response_url && homework.student_response_url !== 'null') {
    urlToLoad = homework.student_response_url;
  } else if (homework.attachment_url && homework.attachment_url !== 'null') {
    urlToLoad = homework.attachment_url;
  }

  if (urlToLoad && urlToLoad.trim() !== '') {
    if (actionBlock) actionBlock.style.display = 'block';
    initHomeworkCanvas(urlToLoad);
  } else {
    if (actionBlock) actionBlock.style.display = 'none';
  }

  // Скролимо до блоку вирішення
  const solvingBlock = document.querySelector('.homework-alert-box');
  if (solvingBlock) {
    solvingBlock.scrollIntoView({ behavior: 'smooth' });
  }
};


// =========================================================================
// АВТОНОМНИЙ МОДУЛЬ ПРОФІЛЮ + ЗАВАНТАЖЕННЯ АВАТАРОК (ОНОВЛЕНИЙ)
// =========================================================================

let currentProfileStudentId = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Завантажуємо дані профілю
  await loadStudentProfileData();

  // 2. Обробка форми збереження тексту
  const profileForm = document.getElementById('profile-edit-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveStudentProfileData();
    });
  }

  // 3. Слідкуємо за вибором файлу для аватарки
  const avatarFileInput = document.getElementById('profile-avatar-file');
  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await uploadStudentAvatar(file);
      }
    });
  }

  // 4. НОВЕ: Клік по міні-аватарці в шапці перекидає на вкладку «Мій профіль»
  const topBarAvatarBtn = document.getElementById('header-user-avatar');
  if (topBarAvatarBtn) {
    topBarAvatarBtn.addEventListener('click', () => {
      // Шукаємо кнопку перемикання в бічному меню за текстом або атрибутом
      const profileMenuBtn = document.querySelector('[data-tab="profile"]') || 
                             document.getElementById('menu-btn-profile') ||
                             Array.from(document.querySelectorAll('.sidebar-menu li, .sidebar-menu a, .nav-link'))
                                  .find(el => el.textContent.includes('Мій профіль'));
      
      if (profileMenuBtn) {
        profileMenuBtn.click(); // Емулюємо клік по пункту меню
      } else {
        // Запасний варіант перемикання класів активності, якщо навігація побудована інакше
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        const tabProfile = document.getElementById('tab-profile');
        if (tabProfile) tabProfile.classList.add('active');
      }
    });
  }
});

/**
 * ЗАВАНТАЖЕННЯ ДАНИХ З БАЗИ
 */
async function loadStudentProfileData() {
  if (typeof studentSupabase === 'undefined') {
    console.error("Помилка: Supabase не підключена.");
    return;
  }

  try {
    const { data: { user }, error: authError } = await studentSupabase.auth.getUser();
    
    if (user) {
      currentProfileStudentId = user.id;
    } else {
      currentProfileStudentId = localStorage.getItem('studentId') || 
                               localStorage.getItem('userId') || 
                               "8ce6c7d8-e83a-4d1e-aad1-8630f19ea2f4";
    }

    const { data: student, error: dbError } = await studentSupabase
      .from('profiles')
      .select('*')
      .eq('id', currentProfileStudentId)
      .single();

    if (dbError) {
      console.warn("Профіль не знайдено, ініціалізуємо пусту форму.");
      fillProfileFormUI({});
      return;
    }

    if (student) {
      fillProfileFormUI(student);
    }

  } catch (err) {
    console.error("Критична помилка модуля профілю:", err);
  }
}

/**
 * ЗАПОВНЕННЯ ІНТЕРФЕЙСУ
 */
function fillProfileFormUI(student) {
  const elWelcomeName = document.getElementById('profile-full-name');
  if (elWelcomeName) {
    const fullName = `${student.first_name || 'Павло'} ${student.last_name || ''}`.trim();
    elWelcomeName.innerText = fullName;
  }

  // Розраховуємо або отримуємо URL аватарки (з бази чи заглушку)
  const finalAvatarUrl = student.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.first_name || 'Павло') + '&background=5e077e&color=fff&size=158';

  // Відображення головної аватарки в самому модулі профілю
  const elFormAvatar = document.getElementById('profile-modal-img');
  if (elFormAvatar) {
    elFormAvatar.src = finalAvatarUrl;
  }

  // НОВЕ: Автоматично оновлюємо маленьку аватарку в шапці (header)
  const elHeaderAvatar = document.getElementById('header-user-avatar');
  if (elHeaderAvatar) {
    elHeaderAvatar.src = finalAvatarUrl;
  }

  if (document.getElementById('profile-input-name')) {
    document.getElementById('profile-input-name').value = student.first_name || '';
  }
  if (document.getElementById('profile-input-surname')) {
    document.getElementById('profile-input-surname').value = student.last_name || '';
  }

  const inputBirth = document.getElementById('profile-input-birth');
  if (inputBirth) {
    if (student.birth_date) {
      inputBirth.value = student.birth_date.split('T')[0];
    } else {
      inputBirth.value = '';
    }
  }

  if (document.getElementById('profile-display-teacher')) {
    document.getElementById('profile-display-teacher').value = student.teacher_name || 'Кирило ';
  }
  if (document.getElementById('profile-display-created')) {
    document.getElementById('profile-display-created').value = student.created_at 
      ? new Date(student.created_at).toLocaleDateString('uk-UA') 
      : '29.05.2026';
  }
}

/**
 * ФУНКЦІЯ ЗАВАНТАЖЕННЯ ФАЙЛУ АВАТАРКИ В SUPABASE STORAGE
 */
async function uploadStudentAvatar(file) {
  if (!currentProfileStudentId) {
    alert("❌ Не вдалося визначити ID учня для завантаження фото.");
    return;
  }

  // Перевірка розміру файлу (макс. 3MB)
  if (file.size > 3 * 1024 * 1024) {
    alert("⚠️ Файл занадто великий! Максимальний розмір: 3 МБ.");
    return;
  }

  const elFormAvatar = document.getElementById('profile-modal-img');
  const elHeaderAvatar = document.getElementById('header-user-avatar'); // НОВЕ: лінк на шапку
  
  // Візуальний фідбек — міняємо прозорість під час завантаження
  if (elFormAvatar) elFormAvatar.style.opacity = '0.4';
  if (elHeaderAvatar) elHeaderAvatar.style.opacity = '0.4';

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${currentProfileStudentId}_avatar.${fileExt}`;

    // 1. Завантажуємо файл у бакет 'avatars'
    const { data: uploadData, error: uploadError } = await studentSupabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // 2. Отримуємо публічне посилання
    const { data: { publicUrl } } = studentSupabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Додаємо timestamp, щоб обійти кеш браузера
    const finalAvatarUrl = `${publicUrl}?t=${new Date().getTime()}`;

    // 3. Оновлюємо поле avatar_url в таблиці 'profiles'
    const { error: updateError } = await studentSupabase
      .from('profiles')
      .update({ avatar_url: finalAvatarUrl })
      .eq('id', currentProfileStudentId);

    if (updateError) throw updateError;

    // Успіх! Оновлюємо картку профілю
    if (elFormAvatar) {
      elFormAvatar.src = finalAvatarUrl;
      elFormAvatar.style.opacity = '1';
    }
    
    // НОВЕ: Синхронно міняємо аватарку в шапці (усі селектори про всяк випадок)
    if (elHeaderAvatar) {
      elHeaderAvatar.src = finalAvatarUrl;
      elHeaderAvatar.style.opacity = '1';
    }
    const alternativeTopAvatar = document.querySelector('.user-avatar, .profile-avatar img, .dash-avatar');
    if (alternativeTopAvatar) {
      alternativeTopAvatar.src = finalAvatarUrl;
    }

    alert("✅ Аватарку успішно оновлено!");

  } catch (err) {
    console.error("Помилка завантаження аватара:", err);
    alert(`❌ Помилка завантаження фото: ${err.message}`);
    if (elFormAvatar) elFormAvatar.style.opacity = '1';
    if (elHeaderAvatar) elHeaderAvatar.style.opacity = '1';
  }
}

/**
 * ЗБЕРЕЖЕННЯ ТЕКСТОВИХ ДАНИХ
 */
async function saveStudentProfileData() {
  if (!currentProfileStudentId) {
    showProfileAlert("❌ Не знайдено ID користувача.", "error");
    return;
  }

  const firstNameVal = document.getElementById('profile-input-name')?.value.trim() || '';
  const lastNameVal = document.getElementById('profile-input-surname')?.value.trim() || '';
  const birthDateVal = document.getElementById('profile-input-birth')?.value || null;

  if (!firstNameVal) {
    showProfileAlert("⚠️ Поле 'Ім'я' є обов'язковим.", "error");
    return;
  }

  const saveBtn = document.getElementById('btn-save-profile');
  const originalBtnHTML = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Зберігаємо...`;
    saveBtn.disabled = true;
  }

  try {
    const { error } = await studentSupabase
      .from('profiles')
      .upsert({
        id: currentProfileStudentId,
        first_name: firstNameVal,
        last_name: lastNameVal,
        birth_date: birthDateVal,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;

    showProfileAlert("✅ Дані успешно збережено!", "success");
    await loadStudentProfileData();

  } catch (err) {
    console.error("Помилка Supabase:", err);
    showProfileAlert(`❌ Помилка: ${err.message}`, "error");
  } finally {
    if (saveBtn) {
      saveBtn.innerHTML = originalBtnHTML;
      saveBtn.disabled = false;
    }
  }
}

function showProfileAlert(message, type) {
  const alertEl = document.getElementById('profile-alert');
  if (!alertEl) {
    alert(message);
    return;
  }
  alertEl.innerText = message;
  alertEl.className = `profile-alert ${type}`;
  alertEl.classList.remove('hidden');
  setTimeout(() => alertEl.classList.add('hidden'), 4000);
}
// =========================================================================
// ОНОВЛЕНЕ БУРГЕР-МЕНЮ З ОВЕРЛЕЄМ ТА ПЕРЕМИКАННЯМ ВКЛАДОК (ПОВНИЙ ФІКС)
// =========================================================================

function initMenuListeners() {
  const burgerToggle = document.getElementById('dash-burger-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('dash-sidebar-overlay');

  if (burgerToggle && sidebar && overlay) {
    console.log("NovaFlow: Модуль мобільної навігації успішно ініціалізовано.");

    // 1. Клік по кнопці бургера — відкриваємо/закриваємо меню та оверлей
    burgerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    // 2. Клік по оверлею (затемненню) — ховаємо меню
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });

    // 3. Інтегроване перемикання вкладок при кліку на посилання в меню
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
    const allTabs = document.querySelectorAll('.tab-content');

    sidebarLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Якщо це звичайне посилання-вкладка, скасовуємо стандартний перехід по '#'
        if (link.getAttribute('href') === '#' || link.hasAttribute('data-tab')) {
          e.preventDefault();
        }

        const tabTarget = link.getAttribute('data-tab');
        
        // Якщо у лінка є data-tab, перемикаємо контент додатка
        if (tabTarget) {
          console.log(`NovaFlow Навігація: Перемикання на вкладку -> tab-${tabTarget}`);

          // А) Змінюємо активний клас для кнопок у меню
          sidebarLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');

          // Б) Ховаємо всі таби та показуємо лише обрану
          allTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.id === `tab-${tabTarget}`) {
              tab.classList.add('active');
            }
          });
        }

        // В) Після того, як вкладка перемкнулася — плавно ховаємо мобільне меню та оверлей
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    });

    // Окремий обробник для кнопки виходу (щоб не ламати її логіку редіректу)
    const logoutBtn = sidebar.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      });
    }

  } else {
    console.warn("NovaFlow Навігація: Не вдалося знайти елементи мобільного меню в HTML структурі.");
  }
}