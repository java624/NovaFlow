// Конфігурація
const SUPABASE_URL = "https://vagrglarsxjtnsusyonv.supabase.co";
// Ось виправлений ключ (тут маленька література 'l' в слові publishable):
const SUPABASE_ANON_KEY = "sb_publishable_mghDtAmpvA7Y2kCbtOY57w_MP15IpOK";

// Ініціалізація клієнта Supabase через глобальне вікно браузера
const authSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Скрипт auth.js успішно ініціалізовано!");

// =======================================================
// ЛОГІКА ДЛЯ СТОРІНКИ РЕЄСТРАЦІЇ (Працює в register.html)
// =======================================================
const registerForm = document.getElementById('register-form');
const regMessage = document.getElementById('reg-message');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    regMessage.style.color = "orange";
    regMessage.innerText = "Реєстрація... Зачекайте.";

    try {
      // 1. Створюємо користувача в Supabase Auth
      // Передаємо full_name в options.data, щоб твій SQL-тригер в базі автоматично звідти його прочитав
      const { data: authData, error: authError } = await authSupabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (authError) {
        regMessage.style.color = "red";
        regMessage.innerText = `Помилка: ${authError.message}`;
        return;
      }

      // 2. Якщо користувача створено, SQL-тригер у базі вже сам створив рядок у profiles!
      if (authData.user) {
        regMessage.style.color = "green";
        regMessage.innerText = "Успіх! Перенаправлення в кабінет...";
        
        // Автоматично перекидаємо нового учня на його дашборд
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      }
    } catch (err) {
      regMessage.style.color = "red";
      regMessage.innerText = `Критична помилка: ${err.message}`;
    }
  });
}

// =======================================================
// ЛОГІКА ДЛЯ СТОРІНКИ ВХОДУ (Працює в login.html)
// =======================================================
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    loginMessage.style.color = "orange";
    loginMessage.innerText = "Перевірка даних...";

    try {
      // Логінимо користувача через вбудований Auth
      const { data, error } = await authSupabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        loginMessage.style.color = "red";
        loginMessage.innerText = `Помилка входу: ${error.message}`;
        return;
      }

      // Якщо пароль правильний, робимо запит до твоєї таблиці profiles, щоб дізнатися роль
      if (data.user) {
        loginMessage.style.color = "green";
        loginMessage.innerText = "Вхід успішний! Визначаємо роль користувача...";

        const { data: profile, error: profileError } = await authSupabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error("Помилка зчитування профілю користувача:", profileError.message);
          // Якщо сталася непередбачувана помилка профілю, про всяк випадок кидаємо на стандартний дашборд учня
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
          return;
        }

        // Розумне перенаправлення на основі значення в колонці 'role' таблиці profiles
        setTimeout(() => {
          if (profile && profile.role === 'teacher') {
            window.location.href = "teacher.html"; // Кирило автоматично потрапить сюди
          } else {
            window.location.href = "dashboard.html"; // Софія та інші учні потраплять сюди
          }
        }, 1000);
      }

    } catch (err) {
      loginMessage.style.color = "red";
      loginMessage.innerText = `Помилка мережі: ${err.message}`;
    }
  });
}

// =======================================================
// ГЛОБАЛЬНА ЛОГІКА ПОКАЗУ/ПРИХОВУВАННЯ ПАРОЛЯ ("ОКО")
// =======================================================
document.addEventListener("DOMContentLoaded", function() {
  // Шукаємо всі іконки ока на сторінці (працюватиме і на вхід, і на реєстрацію)
  const togglePasswordIcons = document.querySelectorAll('.toggle-password-icon');

  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
      // Шукаємо інпут пароля, який знаходиться в одному блоці (input-group) з цією іконкою
      const passwordInput = this.parentElement.querySelector('.password-input');

      if (passwordInput) {
        const currentType = passwordInput.getAttribute('type');

        if (currentType === 'password') {
          // Показуємо пароль
          passwordInput.setAttribute('type', 'text');
          // Змінюємо іконку на перекреслене око
          this.classList.remove('fa-eye');
          this.classList.add('fa-eye-slash');
        } else {
          // Ховаємо пароль
          passwordInput.setAttribute('type', 'password');
          // Повертаємо звичайне око
          this.classList.remove('fa-eye-slash');
          this.classList.add('fa-eye');
        }
      }
    });
  });
});