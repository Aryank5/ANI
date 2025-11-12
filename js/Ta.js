
    // Main application
    class VIPPredictor {
      constructor() {
        this.box = document.getElementById('predictorBox');
        this.showLogo = document.getElementById('showPredictorLogo');
        this.periodElem = document.getElementById('textview1Player');
        this.timerElem = document.getElementById('textview2Player');
        this.resultElem = document.getElementById('resultPlayer');
        this.loginPanel = document.getElementById('loginPanel');
        this.uidInput = document.getElementById('uidInput');
        this.loginBtn = document.getElementById('loginBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.loginLoader = document.getElementById('loginLoader');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.miniLogin = document.getElementById('miniLogin');
        
        this.timerInterval = null;
        this.lastPeriodNumber = "";
        this.isLoggedIn = false;
        this.predictionHistory = [];
        this.settings = {
          sound: true,
          notifications: true,
          autohide: false
        };
        
        this.allowedUIDs = new Set(["24120533","2232jn","381iu7","A210"]);
    
        this.init();
      }
      
      init() {
        this.loadSettings();
        this.loadHistory();
        this.setupEventListeners();
        this.setupExternalButtons();
        
        // Check if user is already logged in
        const savedLogin = localStorage.getItem('predictorLoggedIn');
        if (savedLogin === 'false') {
          this.loginSuccess();
        } else {
          this.miniLogin.classList.remove('hidden');
        }
        
        // Request notification permission if needed
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
      
      loadSettings() {
        const savedSettings = localStorage.getItem('predictorSettings');
        if (savedSettings) {
          this.settings = {...this.settings, ...JSON.parse(savedSettings)};
          document.getElementById('soundToggle').checked = this.settings.sound;
          document.getElementById('notificationsToggle').checked = this.settings.notifications;
          document.getElementById('autohideToggle').checked = this.settings.autohide;
        }
      }
      
      loadHistory() {
        const savedHistory = localStorage.getItem('predictionHistory');
        if (savedHistory) {
          this.predictionHistory = JSON.parse(savedHistory);
          this.updateHistoryDisplay();
        }
      }
      
      setupEventListeners() {
        this.loginBtn.addEventListener("click", () => this.handleLogin());
        this.uidInput.addEventListener("keypress", e => { 
          if (e.key === "Enter") this.handleLogin(); 
        });
        
        this.miniLogin.addEventListener("click", () => {
          this.loginPanel.classList.remove('hidden');
        });
        
        // Settings event listeners
        document.getElementById('soundToggle').addEventListener('change', (e) => {
          this.settings.sound = e.target.checked;
          this.saveSettings();
        });

        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
          this.settings.notifications = e.target.checked;
          if (this.settings.notifications && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
          }
          this.saveSettings();
        });

        document.getElementById('autohideToggle').addEventListener('change', (e) => {
          this.settings.autohide = e.target.checked;
          this.saveSettings();
        });
      }
      
      setupExternalButtons() {
        // Setup buttons with external links
        this.setupButton('registerBtn', 'https://t.me/AM_Pro_Casino');
        this.setupButton('supportBtn', 'photo.html');
        this.setupButton('telegramBtn', 'video.html');
      }
      
      setupButton(buttonId, url) {
        const button = document.getElementById(buttonId);
        if (button) {
          button.addEventListener('click', () => {
            window.open(url, '_blank');
          });
        }
      }
      
      handleLogin() {
        const uid = this.uidInput.value.trim();
        if (!uid) return this.showError("Please enter a UID");

        this.loginBtn.classList.add('hidden');
        this.loginLoader.style.display = "block";

        // Simulate authentication delay
        setTimeout(() => {
          if (this.allowedUIDs.has(uid)) {
            this.loginSuccess();
          } else {
            this.loginFailed();
          }
        }, 1000);
      }
      
      loginSuccess() {
        this.isLoggedIn = true;
        this.loginPanel.classList.add('hidden');
        this.miniLogin.classList.add('hidden');
        this.box.classList.remove('hidden');
        this.loginLoader.style.display = "none";
        this.hideError();
        
        // Save login state
        localStorage.setItem('predictorLoggedIn', 'true');
        
        // Initialize predictor functionality
        this.makeDraggableElements();
        this.startTimer();
        this.updateResults();
        setInterval(() => this.updateResults(), 30000);
        
        this.showNotification('Login successful!', 'success');
      }
      
      loginFailed() {
        this.showError("Invalid UID. Please try again.");
        this.loginBtn.classList.remove('hidden');
        this.loginLoader.style.display = "none";
      }
      
      showError(msg) {
        this.errorMessage.textContent = msg;
        this.errorMessage.style.display = "block";
        this.uidInput.style.borderColor = "var(--danger-color)";
      }
      
      hideError() {
        this.errorMessage.style.display = "none";
        this.uidInput.style.borderColor = "var(--primary-color)";
      }
      
      saveSettings() {
        localStorage.setItem('predictorSettings', JSON.stringify(this.settings));
      }
      
      startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
          const now = new Date();
          const remaining = 60 - (now.getUTCSeconds() % 30);
          this.timerElem.textContent = `00:${String(remaining).padStart(2,'0')}`;
          if (remaining === 60) this.updateResults();
        }, 1000);
      }
      
      makeDraggableElements() {
        document.querySelectorAll('.panel').forEach(el => this.makeDraggable(el));
      }
      
      makeDraggable(el) {
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
          if (e.target.tagName !== "BUTTON" && e.target.type !== "checkbox" && !e.target.classList.contains('close-btn')) 
            start(e.clientX, e.clientY); 
        });
        document.addEventListener('mousemove', e => move(e.clientX, e.clientY));
        document.addEventListener('mouseup', stop);

        el.addEventListener('touchstart', e => { 
          if (e.target.tagName !== "BUTTON" && e.target.type !== "checkbox" && !e.target.classList.contains('close-btn')) 
            start(e.touches[0].clientX, e.touches[0].clientY); 
        });
        document.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY));
        document.addEventListener('touchend', stop);
      }
      
      calculatePeriodNumber() {
        const now = new Date();
        const totalMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        return `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}1000${10001+totalMinutes}`;
      }
      
      getResult() {
        const number = Math.floor(Math.random() * 10);
        const type = number >= 5 ? "Big" : "Small";
        return { number, type };
      }
      
      updateResults() {
        const periodNumber = this.calculatePeriodNumber();
        if (periodNumber !== this.lastPeriodNumber) {
          this.lastPeriodNumber = periodNumber;
          const { number, type } = this.getResult();
          this.periodElem.textContent = periodNumber;
          this.resultElem.textContent = `${type} ${number}`;
          this.resultElem.className = '';
          this.resultElem.classList.add(type.toLowerCase(), 'animate');
          
          // Add to history
          this.predictionHistory.unshift({
            period: periodNumber,
            result: `${type} (${number})`,
            timestamp: new Date().toLocaleTimeString()
          });
          
          // Keep only last 10 entries
          if (this.predictionHistory.length > 10) {
            this.predictionHistory = this.predictionHistory.slice(0, 10);
          }
          
          // Save to localStorage
          localStorage.setItem('predictionHistory', JSON.stringify(this.predictionHistory));
          
          // Update history display
          this.updateHistoryDisplay();
          
          // Play sound if enabled
          if (this.settings.sound) {
            this.playResultSound(type);
          }
          
          // Show notification if enabled
          if (this.settings.notifications) {
            this.showNotification(`Prediction: ${type} (${number})`, 'info');
          }
          
          setTimeout(() => this.resultElem.classList.remove('animate'), 300);
        }
      }
      
      updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        this.predictionHistory.forEach(item => {
          const historyItem = document.createElement('div');
          historyItem.className = 'history-item';
          historyItem.innerHTML = `
            <span>${item.period}</span>
            <span>${item.result}</span>
            
          `;
          this.historyList.appendChild(historyItem);
        });
      }
      
      playResultSound(type) {
        // In a real implementation, you would play an actual sound file
        console.log(`Playing ${type} result sound`);
      }
      
      showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to container
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
          notification.remove();
        }, 3000);
        
        // Also show browser notification if enabled and permitted
        if (this.settings.notifications && "Notification" in window && Notification.permission === "granted") {
          new Notification(`AM VIP Predictor`, {
            body: message,
            icon: "https://i.ibb.co/4nG9q6c1/1000-png.png"
          });
        }
      }
    }

    // Global functions for UI controls
    window.hideBox = () => { 
      predictor.box.classList.add('hidden'); 
      predictor.showLogo.classList.remove('hidden'); 
    };

    window.showBox = () => { 
      if (!predictor.isLoggedIn) { 
        predictor.loginPanel.classList.remove('hidden'); 
        return; 
      } 
      predictor.box.classList.remove('hidden'); 
      predictor.showLogo.classList.add('hidden'); 
    };

    window.toggleHistory = () => {
      if (predictor.historyPanel.classList.contains('hidden')) {
        predictor.historyPanel.classList.remove('hidden');
        predictor.box.classList.add('hidden');
      } else {
        predictor.historyPanel.classList.add('hidden');
        predictor.box.classList.remove('hidden');
      }
    };

    window.toggleSettings = () => {
      predictor.settingsPanel.classList.toggle('hidden');
    };

    window.logout = () => {
      if (confirm("Are you sure you want to logout?")) {
        predictor.isLoggedIn = false;
        predictor.box.classList.add('hidden');
        predictor.historyPanel.classList.add('hidden');
        predictor.settingsPanel.classList.add('hidden');
        predictor.loginPanel.classList.remove('hidden');
        predictor.miniLogin.classList.remove('hidden');
        clearInterval(predictor.timerInterval);
        localStorage.setItem('predictorLoggedIn', 'false');
      }
    };
    
    window.minimizeLogin = () => {
      predictor.loginPanel.classList.add('hidden');
    };

    // Initialize the application
    let predictor;
    document.addEventListener("DOMContentLoaded", () => {
      predictor = new VIPPredictor();
    });
