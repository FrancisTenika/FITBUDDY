/**
 * FitBuddy AI - Frontend Application Core Logic
 * Handles Authentication, Workout Logging, AI Planner, Exercise Library, Timer, BMI & Profile
 */

// ==========================================
// Application State & Storage
// ==========================================
const AppState = {
  token: localStorage.getItem('fitbuddy_token') || null,
  user: JSON.parse(localStorage.getItem('fitbuddy_user') || 'null'),
  workouts: [],
  currentPlan: null,
  activeTab: 'dashboard',
  timer: {
    intervalId: null,
    totalSeconds: 60,
    remainingSeconds: 60,
    isRunning: false,
    mode: 'rest60'
  }
};

// ==========================================
// Toast Notification Utility
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// API Client
// ==========================================
async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (AppState.token) {
    headers['Authorization'] = `Bearer ${AppState.token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(endpoint, options);
    const result = await res.json();
    return { ok: res.ok, status: res.status, data: result };
  } catch (err) {
    console.warn(`API request to ${endpoint} failed:`, err);
    return { ok: false, status: 0, error: err.message };
  }
}

// ==========================================
// Tab Switching
// ==========================================
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Update Nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  // Update Tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.toggle('active', tab.id === `tab-${tabId}`);
  });

  // Trigger tab-specific loaders
  if (tabId === 'dashboard') {
    loadDashboardData();
  } else if (tabId === 'workouts') {
    loadWorkouts();
  } else if (tabId === 'profile') {
    loadProfileData();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// Authentication Management
// ==========================================
function updateAuthUI() {
  const guestWidget = document.getElementById('guest-widget');
  const userWidget = document.getElementById('user-widget');
  const userAvatar = document.getElementById('user-avatar-initial');
  const userName = document.getElementById('user-display-name');
  const heroGreeting = document.getElementById('hero-user-greeting');

  if (AppState.token && AppState.user) {
    if (guestWidget) guestWidget.style.display = 'none';
    if (userWidget) userWidget.style.display = 'flex';
    if (userAvatar) userAvatar.innerText = (AppState.user.name || 'U').charAt(0).toUpperCase();
    if (userName) userName.innerText = AppState.user.name || 'Athlete';
    if (heroGreeting) heroGreeting.innerText = `Welcome back, ${AppState.user.name}!`;

    // Fill profile fields
    const profName = document.getElementById('prof-name');
    const profEmail = document.getElementById('prof-email');
    const profAge = document.getElementById('prof-age');
    const profWeight = document.getElementById('prof-weight');
    const profHeight = document.getElementById('prof-height');
    const profGoal = document.getElementById('prof-goal');

    if (profName) profName.value = AppState.user.name || '';
    if (profEmail) profEmail.value = AppState.user.email || '';
    if (profAge) profAge.value = AppState.user.age || '';
    if (profWeight) profWeight.value = AppState.user.weight || '';
    if (profHeight) profHeight.value = AppState.user.height || '';
    if (profGoal) profGoal.value = AppState.user.goal || AppState.user.fitnessGoal || 'general fitness';
  } else {
    if (guestWidget) guestWidget.style.display = 'flex';
    if (userWidget) userWidget.style.display = 'none';
    if (heroGreeting) heroGreeting.innerText = 'Welcome to FitBuddy AI!';
  }
}

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('active');
  setAuthModalTab(mode);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

function setAuthModalTab(mode) {
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('login-form-box');
  const registerForm = document.getElementById('register-form-box');

  if (mode === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please enter both email and password', 'error');
    return;
  }

  const res = await apiRequest('/api/auth/login', 'POST', { email, password });

  if (res.ok && res.data.token) {
    AppState.token = res.data.token;
    AppState.user = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email
    };

    localStorage.setItem('fitbuddy_token', AppState.token);
    localStorage.setItem('fitbuddy_user', JSON.stringify(AppState.user));

    showToast(`Welcome back, ${res.data.name}!`, 'success');
    closeAuthModal();
    updateAuthUI();
    loadDashboardData();
    loadWorkouts();
  } else {
    showToast(res.data?.message || 'Login failed. Please check credentials.', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const goal = document.getElementById('reg-goal').value;

  if (!name || !email || !password) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const res = await apiRequest('/api/auth/register', 'POST', { name, email, password, goal });

  if (res.ok && res.data.token) {
    AppState.token = res.data.token;
    AppState.user = {
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      goal: goal
    };

    localStorage.setItem('fitbuddy_token', AppState.token);
    localStorage.setItem('fitbuddy_user', JSON.stringify(AppState.user));

    showToast(`Account created successfully! Welcome, ${name}!`, 'success');
    closeAuthModal();
    updateAuthUI();
    loadDashboardData();
    loadWorkouts();
  } else {
    showToast(res.data?.message || 'Registration failed. Try again.', 'error');
  }
}

function handleLogout() {
  AppState.token = null;
  AppState.user = null;
  localStorage.removeItem('fitbuddy_token');
  localStorage.removeItem('fitbuddy_user');
  updateAuthUI();
  showToast('Logged out successfully', 'info');
  loadDashboardData();
}

// ==========================================
// Dashboard Metrics & Overview
// ==========================================
async function loadDashboardData() {
  let workouts = [];

  if (AppState.token) {
    const res = await apiRequest('/api/workouts', 'GET');
    if (res.ok && res.data && res.data.workouts) {
      workouts = res.data.workouts;
      AppState.workouts = workouts;
    }
  }

  // Fallback to local sample workouts if empty
  if (workouts.length === 0) {
    workouts = JSON.parse(localStorage.getItem('fitbuddy_local_workouts') || '[]');
  }

  const totalCount = workouts.length;
  const totalCalories = workouts.reduce((sum, w) => sum + (Number(w.caloriesBurned) || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);

  // Update UI Stats
  const elWorkouts = document.getElementById('stat-total-workouts');
  const elCalories = document.getElementById('stat-total-calories');
  const elDuration = document.getElementById('stat-total-duration');
  const elStreak = document.getElementById('stat-streak');

  if (elWorkouts) elWorkouts.innerText = totalCount;
  if (elCalories) elCalories.innerText = totalCalories.toLocaleString();
  if (elDuration) elDuration.innerText = `${totalDuration}m`;
  if (elStreak) elStreak.innerText = totalCount > 0 ? `${Math.min(totalCount, 7)} Days` : '0 Days';

  // Render Recent Activity Feed
  const feed = document.getElementById('recent-workouts-feed');
  if (feed) {
    if (workouts.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🏋️ No workouts logged yet</p>
          <p style="font-size: 0.88rem;">Click "Generate AI Plan" or "Log Workout" to get started!</p>
        </div>
      `;
    } else {
      const recent = workouts.slice(0, 4);
      feed.innerHTML = recent.map(w => `
        <div class="workout-item">
          <div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff;">${w.title || w.name || 'Workout Session'}</h4>
            <div class="workout-meta">
              <span class="category-tag tag-${(w.category || 'strength').toLowerCase()}">${w.category || 'Strength'}</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">⏱️ ${w.duration || 30} mins</span>
              <span style="font-size: 0.85rem; color: #f43f5e;">🔥 ${w.caloriesBurned || 0} kcal</span>
              <span style="font-size: 0.82rem; color: var(--text-dim);">${new Date(w.date || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="quickViewWorkout('${w._id || w.id}')">View</button>
        </div>
      `).join('');
    }
  }
}

// ==========================================
// AI Workout & Nutrition Plan Generator
// ==========================================
async function handleGenerateAIPlan(e) {
  e.preventDefault();

  const name = document.getElementById('ai-name').value.trim() || (AppState.user?.name || 'Athlete');
  const age = document.getElementById('ai-age').value || 25;
  const weight = document.getElementById('ai-weight').value || 70;
  const goal = document.getElementById('ai-goal').value;
  const intensity = document.getElementById('ai-intensity').value;

  const loadingBox = document.getElementById('ai-loading-box');
  const resultBox = document.getElementById('ai-plan-result');
  const stepText = document.getElementById('loading-step-text');

  loadingBox.style.display = 'block';
  resultBox.style.display = 'none';

  const steps = [
    '🧠 Analyzing metabolic profile and biomechanics...',
    '📊 Structuring 7-Day progressive overload split...',
    '🥗 Computing caloric expenditure and protein targets...',
    '⚡ Finalizing your personalized FitBuddy Masterplan...'
  ];

  let stepIdx = 0;
  stepText.innerText = steps[0];
  const stepInterval = setInterval(() => {
    stepIdx = (stepIdx + 1) % steps.length;
    stepText.innerText = steps[stepIdx];
  }, 700);

  const res = await apiRequest('/api/ai/generate-plan', 'POST', {
    name,
    age,
    weight,
    goal,
    intensity
  });

  clearInterval(stepInterval);
  loadingBox.style.display = 'none';

  if (res.ok && res.data && res.data.plan) {
    AppState.currentPlan = res.data.plan;
    renderAIPlan(res.data.plan);
    resultBox.style.display = 'block';
    showToast('AI Workout & Nutrition Plan generated!', 'success');
  } else {
    showToast('Failed to generate AI plan. Please try again.', 'error');
  }
}

function renderAIPlan(plan) {
  const metaContainer = document.getElementById('ai-plan-meta');
  const daysContainer = document.getElementById('ai-plan-days');
  const nutriContainer = document.getElementById('ai-nutrition-content');

  // Meta Info
  metaContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.4rem; font-weight: 700; color: #fff;">🏆 7-Day Plan for ${plan.userName}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Goal: <strong>${plan.goal}</strong> | Intensity: <strong>${plan.intensity}</strong> | Target Weight: <strong>${plan.userWeight} kg</strong></p>
      </div>
      <button class="btn btn-success btn-sm" onclick="saveAllPlanWorkouts()">⚡ Save All 7 Days to Workouts</button>
    </div>
  `;

  // Render 7 Days
  daysContainer.innerHTML = plan.days.map((d, index) => `
    <div class="day-card">
      <div class="day-header" onclick="toggleDayCollapse('day-body-${index}')">
        <div class="day-title">
          <span>📅</span>
          <span>${d.day}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span class="day-focus">${d.focus}</span>
          <span style="color: #f43f5e; font-size: 0.85rem; font-weight: 700;">🔥 ${d.caloriesBurned} kcal</span>
          <span id="icon-day-body-${index}">▼</span>
        </div>
      </div>
      <div class="day-body" id="day-body-${index}">
        <table class="exercise-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps / Time</th>
              <th>Rest</th>
              <th>Form Cues</th>
            </tr>
          </thead>
          <tbody>
            ${d.exercises.map(ex => `
              <tr>
                <td class="exercise-name">${ex.name}</td>
                <td><span class="badge" style="background: rgba(99, 102, 241, 0.2);">${ex.sets}</span></td>
                <td><strong>${ex.reps}</strong></td>
                <td style="color: #38bdf8;">${ex.rest || '60s'}</td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">${ex.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 0.75rem 1rem; border-radius: var(--radius-sm);">
          <div style="font-size: 0.88rem; color: var(--text-muted);">
            🏃 <strong>Cardio/Finisher:</strong> ${d.cardio}
          </div>
          <button class="btn btn-primary btn-sm" onclick="logPlanDay(${index})">+ Add to My Log</button>
        </div>
      </div>
    </div>
  `).join('');

  // Nutrition Card
  if (plan.nutrition) {
    nutriContainer.innerHTML = `
      <div class="nutrition-stat-grid">
        <div class="nutri-box">
          <div class="val">${plan.nutrition.dailyCalories}</div>
          <div class="lbl">Daily Calories</div>
        </div>
        <div class="nutri-box">
          <div class="val" style="color: #38bdf8;">${plan.nutrition.proteinTargetGrams}g</div>
          <div class="lbl">Daily Protein</div>
        </div>
        <div class="nutri-box">
          <div class="val" style="color: #06b6d4;">${plan.nutrition.waterTargetLiters} L</div>
          <div class="lbl">Hydration Target</div>
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1.25rem;">
        <h4 style="font-size: 1rem; font-weight: 700; color: #10b981; margin-bottom: 0.75rem;">🥗 AI Nutritional Directives:</h4>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          ${plan.nutrition.tips.map(t => `<li style="font-size: 0.9rem; color: var(--text-main); display: flex; gap: 0.5rem;"><span>✔️</span> <span>${t}</span></li>`).join('')}
        </ul>
      </div>
    `;
  }
}

function toggleDayCollapse(id) {
  const body = document.getElementById(id);
  const icon = document.getElementById(`icon-${id}`);
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'block';
    if (icon) icon.innerText = '▼';
  } else {
    body.style.display = 'none';
    if (icon) icon.innerText = '▶';
  }
}

async function logPlanDay(dayIndex) {
  if (!AppState.currentPlan || !AppState.currentPlan.days[dayIndex]) return;

  const day = AppState.currentPlan.days[dayIndex];
  const workoutData = {
    title: day.day,
    name: day.day,
    category: day.focus.includes('Cardio') ? 'Cardio' : 'Strength',
    duration: 45,
    caloriesBurned: day.caloriesBurned || 350,
    intensity: AppState.currentPlan.intensity.toLowerCase() || 'medium',
    exercises: day.exercises.map(ex => ({
      name: ex.name,
      sets: ex.sets || 3,
      reps: typeof ex.reps === 'number' ? ex.reps : 10,
      weight: 0,
      duration: 0
    })),
    notes: `Cardio: ${day.cardio}`
  };

  await createWorkoutDirect(workoutData);
}

async function saveAllPlanWorkouts() {
  if (!AppState.currentPlan) return;
  for (let i = 0; i < AppState.currentPlan.days.length; i++) {
    await logPlanDay(i);
  }
  showToast('All 7 days added to your workout history!', 'success');
  switchTab('workouts');
}

// ==========================================
// Workout Logger & Tracker
// ==========================================
async function loadWorkouts() {
  let workouts = [];

  if (AppState.token) {
    const res = await apiRequest('/api/workouts', 'GET');
    if (res.ok && res.data && res.data.workouts) {
      workouts = res.data.workouts;
      AppState.workouts = workouts;
    }
  }

  if (workouts.length === 0) {
    workouts = JSON.parse(localStorage.getItem('fitbuddy_local_workouts') || '[]');
  }

  renderWorkoutList(workouts);
}

function renderWorkoutList(workouts) {
  const container = document.getElementById('workouts-list-container');
  if (!container) return;

  if (workouts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
        <p style="font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">📋 No Workouts Logged Yet</p>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">Start tracking your fitness progress or load a routine template!</p>
        <button class="btn btn-primary" onclick="openLogWorkoutModal()">+ Log First Workout</button>
      </div>
    `;
    return;
  }

  container.innerHTML = workouts.map(w => `
    <div class="workout-item" id="workout-${w._id || w.id}">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">${w.title || w.name || 'Workout Session'}</h3>
          <span class="category-tag tag-${(w.category || 'strength').toLowerCase()}">${w.category || 'Strength'}</span>
        </div>
        <div class="workout-meta">
          <span style="color: var(--text-muted); font-size: 0.88rem;">⏱️ <strong>${w.duration || 30}</strong> min</span>
          <span style="color: #f43f5e; font-size: 0.88rem;">🔥 <strong>${w.caloriesBurned || 0}</strong> kcal</span>
          <span style="color: #38bdf8; font-size: 0.88rem;">⚡ ${w.intensity || 'Medium'}</span>
          <span style="color: var(--text-dim); font-size: 0.82rem;">📅 ${new Date(w.date || Date.now()).toLocaleDateString()}</span>
        </div>
        ${w.exercises && w.exercises.length > 0 ? `
          <div style="margin-top: 0.6rem; display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${w.exercises.map(e => `<span style="font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">${e.name} (${e.sets}x${e.reps || 10})</span>`).join('')}
          </div>
        ` : ''}
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-danger btn-sm" onclick="deleteWorkoutItem('${w._id || w.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function openLogWorkoutModal() {
  const modal = document.getElementById('workout-modal');
  if (modal) modal.classList.add('active');
}

function closeLogWorkoutModal() {
  const modal = document.getElementById('workout-modal');
  if (modal) modal.classList.remove('active');
}

function addExerciseRow() {
  const container = document.getElementById('exercise-rows-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'form-row exercise-input-row';
  row.style.marginBottom = '0.5rem';
  row.innerHTML = `
    <input type="text" placeholder="Exercise Name (e.g. Bench Press)" class="ex-name" required />
    <input type="number" placeholder="Sets" class="ex-sets" value="3" min="1" style="max-width: 90px;" />
    <input type="number" placeholder="Reps" class="ex-reps" value="10" min="1" style="max-width: 90px;" />
    <input type="number" placeholder="Weight (kg)" class="ex-weight" value="0" min="0" style="max-width: 110px;" />
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()" style="padding: 0.5rem;">✕</button>
  `;
  container.appendChild(row);
}

async function handleSaveWorkout(e) {
  e.preventDefault();

  const title = document.getElementById('w-title').value.trim();
  const category = document.getElementById('w-category').value;
  const duration = Number(document.getElementById('w-duration').value) || 30;
  const caloriesBurned = Number(document.getElementById('w-calories').value) || (duration * 8);
  const intensity = document.getElementById('w-intensity').value;
  const notes = document.getElementById('w-notes').value.trim();

  // Gather exercises
  const exerciseRows = document.querySelectorAll('.exercise-input-row');
  const exercises = [];
  exerciseRows.forEach(row => {
    const name = row.querySelector('.ex-name')?.value.trim();
    const sets = Number(row.querySelector('.ex-sets')?.value) || 1;
    const reps = Number(row.querySelector('.ex-reps')?.value) || 10;
    const weight = Number(row.querySelector('.ex-weight')?.value) || 0;

    if (name) {
      exercises.push({ name, sets, reps, weight });
    }
  });

  const workoutData = {
    title,
    name: title,
    category,
    duration,
    caloriesBurned,
    intensity,
    exercises,
    notes,
    date: new Date()
  };

  await createWorkoutDirect(workoutData);
  closeLogWorkoutModal();
}

async function createWorkoutDirect(workoutData) {
  if (AppState.token) {
    const res = await apiRequest('/api/workouts', 'POST', workoutData);
    if (res.ok) {
      showToast('Workout saved to database!', 'success');
      loadWorkouts();
      loadDashboardData();
      return;
    }
  }

  // Local fallback
  const localWorkouts = JSON.parse(localStorage.getItem('fitbuddy_local_workouts') || '[]');
  workoutData.id = 'local_' + Date.now() + Math.random().toString(36).substr(2, 4);
  localWorkouts.unshift(workoutData);
  localStorage.setItem('fitbuddy_local_workouts', JSON.stringify(localWorkouts));

  showToast('Workout saved locally!', 'success');
  loadWorkouts();
  loadDashboardData();
}

async function deleteWorkoutItem(id) {
  if (!confirm('Are you sure you want to delete this workout?')) return;

  if (AppState.token && !id.startsWith('local_')) {
    const res = await apiRequest(`/api/workouts/${id}`, 'DELETE');
    if (res.ok) {
      showToast('Workout deleted', 'info');
      loadWorkouts();
      loadDashboardData();
      return;
    }
  }

  // Local remove
  let localWorkouts = JSON.parse(localStorage.getItem('fitbuddy_local_workouts') || '[]');
  localWorkouts = localWorkouts.filter(w => (w._id || w.id) !== id);
  localStorage.setItem('fitbuddy_local_workouts', JSON.stringify(localWorkouts));

  showToast('Workout removed', 'info');
  loadWorkouts();
  loadDashboardData();
}

// Pre-built Quick Routine Templates
function logQuickTemplate(templateKey) {
  const templates = {
    fullbody: {
      title: "Full Body Blast",
      category: "Strength",
      duration: 45,
      caloriesBurned: 400,
      intensity: "high",
      exercises: [
        { name: "Barbell Squats", sets: 4, reps: 10, weight: 60 },
        { name: "Bench Press", sets: 4, reps: 8, weight: 50 },
        { name: "Bent-Over Rows", sets: 3, reps: 10, weight: 40 },
        { name: "Plank Hold", sets: 3, reps: 45, weight: 0 }
      ]
    },
    hiit: {
      title: "HIIT Cardio Blitz",
      category: "HIIT",
      duration: 25,
      caloriesBurned: 350,
      intensity: "extreme",
      exercises: [
        { name: "Burpees", sets: 4, reps: 15, weight: 0 },
        { name: "Jump Squats", sets: 4, reps: 20, weight: 0 },
        { name: "Mountain Climbers", sets: 4, reps: 30, weight: 0 },
        { name: "Kettlebell Swings", sets: 4, reps: 20, weight: 16 }
      ]
    },
    core: {
      title: "Abs & Core Destroyer",
      category: "Strength",
      duration: 20,
      caloriesBurned: 180,
      intensity: "medium",
      exercises: [
        { name: "Hanging Leg Raises", sets: 3, reps: 12, weight: 0 },
        { name: "Russian Twists", sets: 3, reps: 20, weight: 10 },
        { name: "Ab Wheel Rollouts", sets: 3, reps: 10, weight: 0 },
        { name: "Side Planks", sets: 2, reps: 30, weight: 0 }
      ]
    }
  };

  if (templates[templateKey]) {
    createWorkoutDirect(templates[templateKey]);
  }
}

// ==========================================
// Exercise Library & Interval Timer
// ==========================================
const ExerciseDB = [
  { name: "Barbell Bench Press", target: "Chest", equipment: "Barbell", level: "Intermediate", tip: "Keep shoulder blades pinched back and drive through your heels." },
  { name: "Barbell Back Squat", target: "Quads & Glutes", equipment: "Barbell", level: "Intermediate", tip: "Break at hips and knees simultaneously; maintain neutral lumbar spine." },
  { name: "Deadlift", target: "Hamstrings & Back", equipment: "Barbell", level: "Advanced", tip: "Hinge at the hips and engage your lats before pulling." },
  { name: "Pull-Ups", target: "Lats & Biceps", equipment: "Bodyweight", level: "Intermediate", tip: "Pull chest up to the bar rather than just chin over." },
  { name: "Overhead Shoulder Press", target: "Shoulders", equipment: "Dumbbells", level: "Beginner", tip: "Avoid arching lower back; brace core throughout the press." },
  { name: "Dumbbell Bicep Curls", target: "Biceps", equipment: "Dumbbells", level: "Beginner", tip: "Keep elbows pinned to your sides to prevent shoulder takeover." },
  { name: "Tricep Dips", target: "Triceps", equipment: "Parallel Bars / Bench", level: "Intermediate", tip: "Lower until elbows reach 90 degrees." },
  { name: "Romanian Deadlift (RDL)", target: "Hamstrings", equipment: "Dumbbells", level: "Intermediate", tip: "Push hips back as far as possible while keeping soft knees." },
  { name: "Bulgarian Split Squat", target: "Quads & Glutes", equipment: "Dumbbells", level: "Intermediate", tip: "Place rear foot on bench and descend straight down." },
  { name: "Forearm Plank", target: "Core", equipment: "Bodyweight", level: "Beginner", tip: "Create full-body tension: squeeze glutes and brace abdominals." }
];

function renderExerciseLibrary() {
  const grid = document.getElementById('exercise-library-grid');
  if (!grid) return;

  grid.innerHTML = ExerciseDB.map(ex => `
    <div class="exercise-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
        <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff;">${ex.name}</h4>
        <span class="badge" style="background: rgba(99, 102, 241, 0.2); font-size: 0.75rem;">${ex.level}</span>
      </div>
      <p style="color: #38bdf8; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem;">🎯 Target: ${ex.target} | 🏋️ ${ex.equipment}</p>
      <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.4;">${ex.tip}</p>
    </div>
  `).join('');
}

// Timer Functions
function setTimerMode(mode, seconds) {
  AppState.timer.mode = mode;
  AppState.timer.totalSeconds = seconds;
  AppState.timer.remainingSeconds = seconds;

  document.querySelectorAll('.timer-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timer-time-display');
  if (!display) return;

  const mins = Math.floor(AppState.timer.remainingSeconds / 60);
  const secs = AppState.timer.remainingSeconds % 60;
  display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
  if (AppState.timer.isRunning) return;

  AppState.timer.isRunning = true;
  document.getElementById('timer-start-btn').innerText = '⏸️ Pause';

  AppState.timer.intervalId = setInterval(() => {
    if (AppState.timer.remainingSeconds > 0) {
      AppState.timer.remainingSeconds--;
      updateTimerDisplay();
    } else {
      pauseTimer();
      showToast('⏰ Time is up! Great set!', 'success');
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }
  }, 1000);
}

function pauseTimer() {
  AppState.timer.isRunning = false;
  clearInterval(AppState.timer.intervalId);
  const startBtn = document.getElementById('timer-start-btn');
  if (startBtn) startBtn.innerText = '▶️ Start';
}

function resetTimer() {
  pauseTimer();
  AppState.timer.remainingSeconds = AppState.timer.totalSeconds;
  updateTimerDisplay();
}

// ==========================================
// Health & BMI Calculator
// ==========================================
function calculateBMI(e) {
  if (e) e.preventDefault();

  const height = Number(document.getElementById('calc-height').value) || 175;
  const weight = Number(document.getElementById('calc-weight').value) || 70;
  const age = Number(document.getElementById('calc-age').value) || 25;
  const gender = document.getElementById('calc-gender').value;
  const activity = Number(document.getElementById('calc-activity').value) || 1.4;

  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  // BMR (Mifflin-St Jeor)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = (gender === 'female') ? bmr - 161 : bmr + 5;
  const tdee = Math.round(bmr * activity);

  // BMI Category & Meter position
  let category = 'Normal Weight';
  let color = '#10b981';
  let percent = 50;

  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#38bdf8';
    percent = 15;
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal / Healthy Weight';
    color = '#10b981';
    percent = 40;
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    color = '#f59e0b';
    percent = 70;
  } else {
    category = 'Obese (High Body Fat)';
    color = '#f43f5e';
    percent = 90;
  }

  // Update UI
  document.getElementById('bmi-value-text').innerText = bmi;
  document.getElementById('bmi-category-text').innerText = category;
  document.getElementById('bmi-category-text').style.color = color;
  document.getElementById('bmi-pointer').style.left = `${percent}%`;

  document.getElementById('bmr-val').innerText = `${Math.round(bmr)} kcal`;
  document.getElementById('tdee-val').innerText = `${tdee} kcal`;

  // Macros Targets (Standard 40/30/30 split)
  const proteinG = Math.round((tdee * 0.3) / 4);
  const carbG = Math.round((tdee * 0.4) / 4);
  const fatG = Math.round((tdee * 0.3) / 9);

  document.getElementById('macro-protein').innerText = `${proteinG}g`;
  document.getElementById('macro-carbs').innerText = `${carbG}g`;
  document.getElementById('macro-fats').innerText = `${fatG}g`;

  showToast('BMI & Metabolic targets calculated!', 'success');
}

// ==========================================
// Profile Management
// ==========================================
async function loadProfileData() {
  if (AppState.token) {
    const res = await apiRequest('/api/users/profile', 'GET');
    if (res.ok && res.data && res.data.user) {
      AppState.user = { ...AppState.user, ...res.data.user };
      localStorage.setItem('fitbuddy_user', JSON.stringify(AppState.user));
      updateAuthUI();
    }
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();

  const name = document.getElementById('prof-name').value.trim();
  const age = Number(document.getElementById('prof-age').value) || undefined;
  const weight = Number(document.getElementById('prof-weight').value) || undefined;
  const height = Number(document.getElementById('prof-height').value) || undefined;
  const goal = document.getElementById('prof-goal').value;

  if (AppState.token) {
    const res = await apiRequest('/api/users/profile', 'PUT', {
      name, age, weight, height, goal, fitnessGoal: goal
    });

    if (res.ok) {
      AppState.user = { ...AppState.user, name, age, weight, height, goal };
      localStorage.setItem('fitbuddy_user', JSON.stringify(AppState.user));
      showToast('Profile updated successfully!', 'success');
      updateAuthUI();
      return;
    }
  }

  // Local fallback
  AppState.user = { ...(AppState.user || {}), name, age, weight, height, goal };
  localStorage.setItem('fitbuddy_user', JSON.stringify(AppState.user));
  showToast('Profile saved locally', 'success');
  updateAuthUI();
}

async function handleChangePassword(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('curr-pwd').value;
  const newPassword = document.getElementById('new-pwd').value;

  if (!currentPassword || !newPassword) {
    showToast('Please fill both password fields', 'error');
    return;
  }

  if (AppState.token) {
    const res = await apiRequest('/api/users/change-password', 'PUT', { currentPassword, newPassword });
    if (res.ok) {
      showToast('Password updated successfully!', 'success');
      document.getElementById('curr-pwd').value = '';
      document.getElementById('new-pwd').value = '';
      return;
    } else {
      showToast(res.data?.message || 'Password update failed', 'error');
      return;
    }
  }

  showToast('Please sign in to change account password', 'info');
}

// ==========================================
// API Explorer Live Tester
// ==========================================
async function testApiEndpoint(endpoint, method = 'GET') {
  const outBox = document.getElementById('api-tester-output');
  outBox.innerText = `Sending ${method} ${endpoint} ...`;

  const res = await apiRequest(endpoint, method);
  outBox.innerText = JSON.stringify(res, null, 2);
}

// ==========================================
// Initialization on Page Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadDashboardData();
  renderExerciseLibrary();
  updateTimerDisplay();
  calculateBMI();

  // Check backend health
  apiRequest('/api/health').then(res => {
    const statusText = document.getElementById('server-status-text');
    if (statusText) {
      if (res.ok) {
        statusText.innerText = 'Backend API Online (Port 5000)';
      } else {
        statusText.innerText = 'Offline Mode';
      }
    }
  });
});
