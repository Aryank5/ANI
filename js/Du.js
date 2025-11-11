    // Application State
    const state = {
      isLoggedIn: false,
      timerInterval: null,
      lastPeriodNumber: "",
      predictionHistory: [],
      settings: {
        sound: true,
        notifications: true,
        autohide: false
      },



      
      allowedUIDs: new Set([
        "A210", "743bkv", "3498n69"])


      
    };





    // DOM Elements
    const elements = {
      loginPanel: document.getElementById('loginPanel'),
      miniLogin: document.getElementById('miniLogin'),
      uidInput: document.getElementById('uidInput'),
      loginBtn: document.getElementById('loginBtn'),
      errorMessage: document.getElementById('errorMessage'),
      loginLoader: document.getElementById('loginLoader'),
      predictorBox: document.getElementById('predictorBox'),
      showLogo: document.getElementById('showPredictorLogo'),
      periodElem: document.getElementById('textview1Player'),
      timerElem: document.getElementById('textview2Player'),
      resultElem: document.getElementById('resultPlayer'),
      historyPanel: document.getElementById('historyPanel'),
      historyList: document.getElementById('historyList'),
      settingsPanel: document.getElementById('settingsPanel'),
      appSection: document.getElementById('app-section'),
      notificationContainer: document.getElementById('notificationContainer')
    };

    // Initialize Application
    document.addEventListener("DOMContentLoaded", () => {
      loadSavedData();
      setupEventListeners();
      checkLoginStatus();
    });

    function loadSavedData() {
      const savedSettings = localStorage.getItem('predictorSettings');
      if (savedSettings) {
        state.settings = {...state.settings, ...JSON.parse(savedSettings)};
        document.getElementById('soundToggle').checked = state.settings.sound;
        document.getElementById('notificationsToggle').checked = state.settings.notifications;
        document.getElementById('autohideToggle').checked = state.settings.autohide;
      }

      const savedHistory = localStorage.getItem('predictionHistory');
      if (savedHistory) {
        state.predictionHistory = JSON.parse(savedHistory);
        updateHistoryDisplay();
      }
    }

    function checkLoginStatus() {
      const savedLogin = localStorage.getItem('isLoggedIn');
      if (savedLogin === 'false') {
        // Auto-login if previously logged in
        elements.loginPanel.classList.add('hidden');
        elements.appSection.classList.remove('hidden');
        elements.predictorBox.classList.remove('hidden');
        state.isLoggedIn = true;
        initApplication();
      } else {
        // Show mini login button
        elements.miniLogin.classList.remove('hidden');
      }
    }

    function setupEventListeners() {
      // Login
      elements.loginBtn.addEventListener("click", handleLogin);
      elements.uidInput.addEventListener("keypress", e => { 
        if (e.key === "Enter") handleLogin(); 
      });

      // Mini login
      elements.miniLogin.addEventListener("click", () => {
        elements.loginPanel.classList.remove('hidden');
        elements.miniLogin.classList.add('hidden');
      });

      // Settings
      document.getElementById('soundToggle').addEventListener('change', (e) => {
        state.settings.sound = e.target.checked;
        localStorage.setItem('predictorSettings', JSON.stringify(state.settings));
      });

      document.getElementById('notificationsToggle').addEventListener('change', (e) => {
        state.settings.notifications = e.target.checked;
        localStorage.setItem('predictorSettings', JSON.stringify(state.settings));
      });

      document.getElementById('autohideToggle').addEventListener('change', (e) => {
        state.settings.autohide = e.target.checked;
        localStorage.setItem('predictorSettings', JSON.stringify(state.settings));
      });

      // Logo click
      elements.showLogo.addEventListener('click', showBox);
      
      // Request notification permission
      if ('Notification' in window && state.settings.notifications) {
        Notification.requestPermission();
      }
    }

    // Login Functions
    function handleLogin() {
      const uid = elements.uidInput.value.trim();
      if (!uid) return showError("Please enter a UID");

      elements.loginBtn.classList.add('hidden');
      elements.loginLoader.style.display = "block";

      setTimeout(() => {
        if (state.allowedUIDs.has(uid)) {
          loginSuccess();
        } else {
          loginFailed();
        }
      }, 1000);
    }

    function loginSuccess() {
      state.isLoggedIn = true;
      elements.loginPanel.classList.add('hidden');
      elements.miniLogin.classList.add('hidden');
      elements.appSection.classList.remove('hidden');
      elements.loginLoader.style.display = "none";
      hideError();
      
      // Save login state
      localStorage.setItem('isLoggedIn', 'true');
      
      initApplication();
    }

    function loginFailed() {
      showError("Invalid UID. Please try again.");
      elements.loginBtn.classList.remove('hidden');
      elements.loginLoader.style.display = "none";
    }

    function showError(msg) {
      elements.errorMessage.textContent = msg;
      elements.errorMessage.style.display = "block";
      elements.uidInput.style.borderColor = "#ff3366";
    }

    function hideError() {
      elements.errorMessage.style.display = "none";
      elements.uidInput.style.borderColor = "#ff0044";
    }

    // Hide/Exit Functions
    function minimizeLogin() {
      elements.loginPanel.classList.add('hidden');
      elements.miniLogin.classList.remove('hidden');
    }

    function exitApp() {
      if (confirm("Are you sure you want to exit the application?")) {
        window.close();
        // For browsers that don't allow window.close()
        document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: black; color: white; font-size: 24px;">Application Closed</div>';
      }
    }

    function hideBox() {
      elements.predictorBox.classList.add('hidden');
      elements.showLogo.classList.remove('hidden');
    }

    function showBox() {
      if (!state.isLoggedIn) {
        elements.loginPanel.classList.remove('hidden');
        elements.miniLogin.classList.add('hidden');
        return;
      }
      elements.predictorBox.classList.remove('hidden');
      elements.showLogo.classList.add('hidden');
    }

    // Application Core
    function initApplication() {
      makeDraggable(elements.predictorBox);
      makeDraggable(elements.historyPanel);
      makeDraggable(elements.settingsPanel);
      makeDraggable(elements.loginPanel);
      
      startTimer();
      updateResults();
      setInterval(updateResults, 60000);
    }

    function startTimer() {
      clearInterval(state.timerInterval);
      state.timerInterval = setInterval(() => {
        const now = new Date();
        const remaining = 60 - (now.getUTCSeconds() % 60);
        elements.timerElem.textContent = `00:${String(remaining).padStart(2,'0')}`;
        if (remaining === 60) updateResults();
      }, 1000);
    }

    function makeDraggable(el) {
      let isDragging = false, offsetX = 0, offsetY = 0;

      const start = (x, y) => {
        isDragging = true;
        offsetX = x - el.offsetLeft;
        offsetY = y - el.offsetTop;
        el.style.cursor = 'grabbing';
      };
      
      const move = (x, y) => {
        if (!isDragging) return;
        el.style.left = `${x - offsetX}px`;
        el.style.top = `${y - offsetY}px`;
      };
      
      const stop = () => {
        isDragging = false;
        el.style.cursor = 'grab';
      };

      el.addEventListener('mousedown', e => { 
        if (e.target.tagName !== "BUTTON" && e.target.type !== "checkbox") 
          start(e.clientX, e.clientY); 
      });
      document.addEventListener('mousemove', e => move(e.clientX, e.clientY));
      document.addEventListener('mouseup', stop);

      el.addEventListener('touchstart', e => { 
        if (e.target.tagName !== "BUTTON" && e.target.type !== "checkbox") 
          start(e.touches[0].clientX, e.touches[0].clientY); 
      });
      document.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY));
      document.addEventListener('touchend', stop);
    }

    // Panel Management
    window.toggleHistory = () => {
      if (elements.historyPanel.classList.contains('hidden')) {
        elements.historyPanel.classList.remove('hidden');
        elements.predictorBox.classList.add('hidden');
      } else {
        elements.historyPanel.classList.add('hidden');
        elements.predictorBox.classList.remove('hidden');
      }
    };

    window.toggleSettings = () => {
      elements.settingsPanel.classList.toggle('hidden');
    };

    window.logout = () => {
      if (confirm("Are you sure you want to logout?")) {
        state.isLoggedIn = false;
        elements.appSection.classList.add('hidden');
        elements.loginPanel.classList.remove('hidden');
        elements.miniLogin.classList.remove('hidden');
        clearInterval(state.timerInterval);
        
        // Clear login state
        localStorage.setItem('isLoggedIn', 'false');
      }
    };

    // Prediction Logic
    function calculatePeriodNumber() {
      const now = new Date();
      const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
      return `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}1000${10001+totalMinutes}`;
    }

    function getResult() {
      const number = Math.floor(Math.random() * 10);
      const type = number >= 5 ? "Big" : "Small";
      return { number, type };
    }

    function updateResults() {
      const periodNumber = calculatePeriodNumber();
      if (periodNumber !== state.lastPeriodNumber) {
        state.lastPeriodNumber = periodNumber;
        const { number, type } = getResult();
        
        elements.periodElem.textContent = periodNumber;
        elements.resultElem.textContent = `${type} (${number})`;
        elements.resultElem.className = '';
        elements.resultElem.classList.add(type.toLowerCase(), 'animate');
        
        addToHistory(periodNumber, type, number);
        
        playResultEffects(type, number);
        
        setTimeout(() => elements.resultElem.classList.remove('animate'), 300);
      }
    }

    function addToHistory(period, type, number) {
      state.predictionHistory.unshift({
        period: period,
        result: `${type} (${number})`,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (state.predictionHistory.length > 10) {
        state.predictionHistory = state.predictionHistory.slice(0, 10);
      }
      
      localStorage.setItem('predictionHistory', JSON.stringify(state.predictionHistory));
      updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
      elements.historyList.innerHTML = '';
      
      if (state.predictionHistory.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'history-item';
        emptyItem.innerHTML = `<span>No history yet</span>`;
        elements.historyList.appendChild(emptyItem);
        return;
      }
      
      state.predictionHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
          <span>${item.period}</span>
          <span>${item.result}</span>
          <span>${item.timestamp}</span>
        `;
        elements.historyList.appendChild(historyItem);
      });
    }

    function playResultEffects(type, number) {
      if (state.settings.sound) {
        playResultSound(type);
      }
      
      if (state.settings.notifications) {
        showNotification(`New Prediction: ${type} (${number})`, "info");
        showSystemNotification(type, number);
      }
    }

    function playResultSound(type) {
      // In a real implementation, you would play an actual sound file
      console.log(`Playing ${type} result sound`);
    }

    function showSystemNotification(type, number) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`AM VIP Predictor - ${type}`, {
          body: `Prediction: ${type} (${number})`,
          icon: "https://i.ibb.co/4nG9q6c1/1000-png.png"
        });
      }
    }

    // Notification System
    function showNotification(message, type = "info") {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      elements.notificationContainer.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
