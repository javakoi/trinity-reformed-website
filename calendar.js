// Calendar functionality with monthly grid view
class CalendarManager {
    constructor() {
        this.events = [];
        this.isAdmin = false;
        this.editingEventId = null;
        this.currentDate = new Date();
        this.eventsLoaded = false;
        this.githubAPI = new GitHubAPI();
        this.githubAPI.init();
        
        this.loadEvents();
    }

    async loadEvents() {
        try {
            // If GitHub token is set, try to load from GitHub first
            if (this.githubAPI.hasToken()) {
                try {
                    const githubEvents = await this.githubAPI.getFileContent();
                    this.events = githubEvents;
                    localStorage.setItem('churchEvents', JSON.stringify(githubEvents));
                    this.eventsLoaded = true;
                    this.init();
                    return;
                } catch (error) {
                    console.warn('Failed to load from GitHub, falling back to events.json:', error);
                }
            }

            // Load from events.json as primary source (repo version)
            const response = await fetch('events.json');
            if (response.ok) {
                const jsonEvents = await response.json();
                this.events = jsonEvents;
                // Update localStorage to match the repo version
                localStorage.setItem('churchEvents', JSON.stringify(jsonEvents));
            } else {
                // If events.json doesn't exist, fall back to localStorage
                const localEvents = JSON.parse(localStorage.getItem('churchEvents')) || [];
                this.events = localEvents;
            }
        } catch (error) {
            // If fetch fails, use localStorage as fallback
            const localEvents = JSON.parse(localStorage.getItem('churchEvents')) || [];
            this.events = localEvents;
        }
        
        this.eventsLoaded = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCalendar();
        this.checkAdminStatus();
    }

    bindEvents() {
        // Calendar navigation
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Admin toggle
        document.getElementById('admin-toggle').addEventListener('click', () => {
            this.toggleAdmin();
        });

        // Add event button
        document.getElementById('add-event-btn').addEventListener('click', () => {
            this.showEventForm();
        });

        // Event form submission
        document.getElementById('event-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        // GitHub token management
        const githubTokenBtn = document.getElementById('github-token-btn');
        if (githubTokenBtn) {
            githubTokenBtn.addEventListener('click', () => {
                this.toggleGitHubTokenInput();
            });
        }

        const saveTokenBtn = document.getElementById('save-token-btn');
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => {
                this.saveGitHubToken();
            });
        }

        const testTokenBtn = document.getElementById('test-token-btn');
        if (testTokenBtn) {
            testTokenBtn.addEventListener('click', () => {
                this.testGitHubToken();
            });
        }

        const removeTokenBtn = document.getElementById('remove-token-btn');
        if (removeTokenBtn) {
            removeTokenBtn.addEventListener('click', () => {
                this.removeGitHubToken();
            });
        }

        // Cancel edit
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Cancel form
        document.getElementById('cancel-form').addEventListener('click', () => {
            this.cancelForm();
        });
    }

    toggleAdmin() {
        if (!this.isAdmin) {
            const password = prompt('Enter admin password:');
            if (password === 'trinitycrec') { // Updated password
                this.isAdmin = true;
                this.showAdminPanel();
            } else {
                alert('Incorrect password');
            }
        } else {
            this.isAdmin = false;
            this.hideAdminPanel();
        }
    }

    showAdminPanel() {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('add-event-btn').style.display = 'inline-block';
        document.getElementById('admin-toggle').textContent = 'Admin Logout';
        this.updateGitHubTokenUI();
    }

    hideAdminPanel() {
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('add-event-btn').style.display = 'none';
        document.getElementById('admin-toggle').textContent = 'Admin Login';
        this.cancelEdit();
    }

    showEventForm() {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('event-form').reset();
        this.editingEventId = null;
        document.getElementById('cancel-edit').style.display = 'none';
        document.getElementById('cancel-form').style.display = 'inline-block';
        // Scroll to the admin panel
        this.scrollToAdminPanel();
    }

    async saveEvent() {
        const formData = new FormData(document.getElementById('event-form'));
        const eventData = {
            id: this.editingEventId || Date.now(),
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
            type: formData.get('type'),
            description: formData.get('description')
        };

        if (this.editingEventId) {
            // Update existing event
            const index = this.events.findIndex(e => e.id === this.editingEventId);
            if (index !== -1) {
                this.events[index] = eventData;
            }
        } else {
            // Add new event
            this.events.push(eventData);
        }

        await this.saveEvents();
        this.renderCalendar();
        this.hideAdminPanel();
        // Scroll back to calendar
        this.scrollToCalendar();
    }

    cancelEdit() {
        document.getElementById('event-form').reset();
        this.editingEventId = null;
        document.getElementById('cancel-edit').style.display = 'none';
        // Scroll back to calendar
        this.scrollToCalendar();
    }

    cancelForm() {
        document.getElementById('event-form').reset();
        this.editingEventId = null;
        document.getElementById('cancel-edit').style.display = 'none';
        // Scroll back to calendar
        this.scrollToCalendar();
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-type').value = event.type || '';
            document.getElementById('event-description').value = event.description;
            
            this.editingEventId = eventId;
            document.getElementById('cancel-edit').style.display = 'inline-block';
            document.getElementById('cancel-form').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
        }
    }

    editEventAndClose(eventId) {
        // Close the current modal first
        this.closeModal();
        // Then open the edit form
        this.editEvent(eventId);
        // Scroll to the admin panel
        this.scrollToAdminPanel();
    }

    async deleteEvent(eventId) {
        this.events = this.events.filter(e => e.id !== eventId);
        await this.saveEvents();
        this.renderCalendar();
    }

    confirmDeleteEvent(eventId) {
        // Create confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'day-events-modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this event?</p>
                </div>
                <div class="modal-footer">
                    <button onclick="calendarManager.deleteEventAndClose(${eventId})" class="submit-btn" style="background-color: #dc3545;">Yes</button>
                    <button onclick="calendarManager.cancelDelete()" class="submit-btn" style="background-color: #666; margin-left: 10px;">No</button>
                </div>
            </div>
        `;

        document.body.appendChild(confirmModal);

        // Close modal handlers
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) this.cancelDelete();
        });
    }

    deleteEventAndClose(eventId) {
        this.deleteEvent(eventId);
        this.closeModal();
    }

    cancelDelete() {
        this.closeModal();
    }

    scrollToAdminPanel() {
        // Wait a moment for the admin panel to be displayed
        setTimeout(() => {
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) {
                adminPanel.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }

    scrollToCalendar() {
        // Wait a moment for the admin panel to be hidden
        setTimeout(() => {
            const calendarContainer = document.querySelector('.calendar-container');
            if (calendarContainer) {
                calendarContainer.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    }

    async saveEvents() {
        // Always save to localStorage as backup
        localStorage.setItem('churchEvents', JSON.stringify(this.events));
        
        // If GitHub token is set, save to GitHub
        if (this.githubAPI.hasToken()) {
            try {
                const result = await this.githubAPI.saveFileContent(this.events);
                this.showNotification(result.message, 'success');
                // Don't download file if saved to GitHub successfully
                return;
            } catch (error) {
                console.error('Failed to save to GitHub:', error);
                this.showNotification(`Failed to save to GitHub: ${error.message}. Falling back to file download.`, 'error');
                // Fall through to download file as backup
            }
        }
        
        // Download events.json file for admin to upload to repository (fallback)
        setTimeout(() => {
            const dataStr = JSON.stringify(this.events, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'events.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            if (!this.githubAPI.hasToken()) {
                this.showNotification('Events saved locally. Download events.json and upload to GitHub repository to sync.', 'info');
            }
        }, 500);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.calendar-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `calendar-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;

        const colors = {
            success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
            error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
            info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
        };

        const style = colors[type] || colors.info;
        notification.style.backgroundColor = style.bg;
        notification.style.color = style.color;
        notification.style.border = `1px solid ${style.border}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    toggleGitHubTokenInput() {
        const tokenInput = document.getElementById('github-token-input');
        const tokenSection = document.getElementById('github-token-section');
        
        if (tokenSection.style.display === 'none' || !tokenSection.style.display) {
            tokenSection.style.display = 'block';
            if (this.githubAPI.hasToken()) {
                tokenInput.value = '••••••••••••••••'; // Masked token
            }
        } else {
            tokenSection.style.display = 'none';
        }
    }

    async saveGitHubToken() {
        const tokenInput = document.getElementById('github-token-input');
        const token = tokenInput.value.trim();

        if (!token) {
            this.showNotification('Please enter a GitHub token', 'error');
            return;
        }

        this.githubAPI.setToken(token);
        
        // Test the token
        const testResult = await this.githubAPI.testToken();
        if (testResult.valid) {
            this.showNotification('GitHub token saved and verified! Events will now sync to GitHub.', 'success');
            tokenInput.value = '••••••••••••••••'; // Mask token
            this.updateGitHubTokenUI();
        } else {
            this.showNotification(`Token verification failed: ${testResult.message}`, 'error');
            this.githubAPI.clearToken();
        }
    }

    async testGitHubToken() {
        if (!this.githubAPI.hasToken()) {
            this.showNotification('No GitHub token set', 'error');
            return;
        }

        const testResult = await this.githubAPI.testToken();
        if (testResult.valid) {
            this.showNotification('GitHub token is valid!', 'success');
        } else {
            this.showNotification(`Token test failed: ${testResult.message}`, 'error');
        }
    }

    removeGitHubToken() {
        if (confirm('Are you sure you want to remove the GitHub token? Events will no longer sync automatically.')) {
            this.githubAPI.clearToken();
            const tokenInput = document.getElementById('github-token-input');
            if (tokenInput) {
                tokenInput.value = '';
            }
            this.updateGitHubTokenUI();
            this.showNotification('GitHub token removed', 'info');
        }
    }

    updateGitHubTokenUI() {
        const tokenStatus = document.getElementById('github-token-status');
        const removeTokenBtn = document.getElementById('remove-token-btn');
        
        if (this.githubAPI.hasToken()) {
            if (tokenStatus) {
                tokenStatus.textContent = 'GitHub token: ✓ Connected';
                tokenStatus.style.color = '#28a745';
            }
            if (removeTokenBtn) {
                removeTokenBtn.style.display = 'inline-block';
            }
        } else {
            if (tokenStatus) {
                tokenStatus.textContent = 'GitHub token: Not connected';
                tokenStatus.style.color = '#dc3545';
            }
            if (removeTokenBtn) {
                removeTokenBtn.style.display = 'none';
            }
        }
    }

    // Get Sunday date string (YYYY-MM-DD) for the week containing the given date
    getWeekSunday(dateString) {
        const [y, m, d] = dateString.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayOfWeek = date.getDay();
        const sunday = new Date(date);
        sunday.setDate(date.getDate() - dayOfWeek);
        return `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
    }

    // Check if a week (identified by any date in it) has a Parish Week event
    weekHasParishWeek(weekSunday) {
        const [y, m, d] = weekSunday.split('-').map(Number);
        const sunday = new Date(y, m - 1, d);
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(sunday);
            checkDate.setDate(sunday.getDate() + i);
            const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            const hasParishWeek = this.events.some(e => e.type === 'parishweek' && e.date === dateStr);
            if (hasParishWeek) return true;
        }
        return false;
    }

    renderCalendar() {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Update month/year header
        document.getElementById('current-month-year').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Get first day of month and number of days
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Clear calendar
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';

        let cellsInRow = 0;
        let firstDateInRow = null;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty-day';
            calendarDays.appendChild(emptyDay);
            cellsInRow++;
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (firstDateInRow === null) firstDateInRow = dateString;

            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if this day has events (exclude parishweek - those show as week bar)
            const dayEvents = this.events.filter(event => event.date === dateString && event.type !== 'parishweek');
            
            // Sort events by time (earliest first)
            dayEvents.sort((a, b) => {
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                return a.time.localeCompare(b.time);
            });

            if (dayEvents.length > 0) {
                dayElement.classList.add('has-events');
                
                const maxVisibleEvents = 3;
                const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
                const hasMoreEvents = dayEvents.length > maxVisibleEvents;
                
                visibleEvents.forEach((event, index) => {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.className = `event-type-indicator ${event.type || 'special'}`;
                    eventIndicator.style.top = `${2 + (index * 1.5)}rem`;
                    
                    let typeText = '';
                    switch(event.type) {
                        case 'fellowship':
                            typeText = 'Fellowship Meal';
                            break;
                        case 'service':
                            typeText = "Lord's Day Service";
                            break;
                        case 'parishgroups':
                            typeText = 'Parish Groups';
                            break;
                        case 'special':
                        default:
                            typeText = 'Special Event';
                            break;
                    }
                    
                    eventIndicator.textContent = typeText;
                    dayElement.appendChild(eventIndicator);
                });

                if (hasMoreEvents) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.className = 'more-events-indicator';
                    moreIndicator.style.top = `${2 + (maxVisibleEvents * 1.5)}rem`;
                    moreIndicator.textContent = `+${dayEvents.length - maxVisibleEvents} more`;
                    dayElement.appendChild(moreIndicator);
                }

                dayElement.addEventListener('click', () => {
                    this.showDayEvents(dayEvents, dateString);
                });
            } else {
                const allDayEvents = this.events.filter(e => e.date === dateString);
                if (allDayEvents.length > 0) {
                    dayElement.addEventListener('click', () => {
                        this.showDayEvents(allDayEvents, dateString);
                    });
                }
            }

            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            calendarDays.appendChild(dayElement);
            cellsInRow++;

            // End of row - add Parish Week bar if applicable
            if (cellsInRow === 7) {
                const weekSunday = this.getWeekSunday(firstDateInRow);
                if (this.weekHasParishWeek(weekSunday)) {
                    const parishBar = document.createElement('div');
                    parishBar.className = 'parish-week-bar';
                    parishBar.textContent = 'Parish Week';
                    parishBar.setAttribute('aria-label', 'Parish Week');
                    calendarDays.appendChild(parishBar);
                }
                cellsInRow = 0;
                firstDateInRow = null;
            }
        }

        // Fill remaining cells in last row and add parish bar if needed
        if (cellsInRow > 0) {
            const weekSunday = firstDateInRow ? this.getWeekSunday(firstDateInRow) : null;
            while (cellsInRow < 7) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty-day';
                calendarDays.appendChild(emptyDay);
                cellsInRow++;
            }
            if (weekSunday && this.weekHasParishWeek(weekSunday)) {
                const parishBar = document.createElement('div');
                parishBar.className = 'parish-week-bar';
                parishBar.textContent = 'Parish Week';
                parishBar.setAttribute('aria-label', 'Parish Week');
                calendarDays.appendChild(parishBar);
            }
        }
    }

    showDayEvents(events, dateString) {
        // Sort events by time for display in modal
        const sortedEvents = [...events].sort((a, b) => {
            // Handle events without time (put them at the end)
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1;
            if (!b.time) return -1;
            
            // Compare times
            return a.time.localeCompare(b.time);
        });

        const eventList = sortedEvents.map(event => {
            // Get event type display text
            let typeText = '';
            switch(event.type) {
                case 'fellowship':
                    typeText = 'Fellowship Meal';
                    break;
                case 'service':
                    typeText = "Lord's Day Service";
                    break;
                case 'parishgroups':
                    typeText = 'Parish Groups';
                    break;
                case 'parishweek':
                    typeText = 'Parish Week';
                    break;
                case 'special':
                default:
                    typeText = 'Special Event';
                    break;
            }

            const adminControls = this.isAdmin ? `
                <div class="day-event-actions">
                    <button onclick="calendarManager.editEventAndClose(${event.id})" class="edit-btn">Edit</button>
                    <button onclick="calendarManager.confirmDeleteEvent(${event.id})" class="delete-btn">Delete</button>
                </div>
            ` : '';

            return `
                <div class="day-event-item">
                    <div class="event-type-badge ${event.type || 'special'}">${typeText}</div>
                    <strong>${event.title}</strong>
                    ${event.time ? `<br><small>Time: ${event.time}</small>` : ''}
                    ${event.location ? `<br><small>Location: ${event.location}</small>` : ''}
                    ${event.description ? `<br><small>${event.description}</small>` : ''}
                    ${adminControls}
                </div>
            `;
        }).join('');

        // Format date for display
        const dateParts = dateString.split('-');
        const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const modal = document.createElement('div');
        modal.className = 'day-events-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Events for ${formattedDate}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${eventList}
                </div>
                <div class="modal-footer">
                    <button onclick="calendarManager.closeModal()" class="submit-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    closeModal() {
        const modals = document.querySelectorAll('.day-events-modal');
        modals.forEach(modal => {
            modal.remove();
        });
    }

    checkAdminStatus() {
        // Check if admin was previously logged in (simple session management)
        const adminSession = sessionStorage.getItem('adminSession');
        if (adminSession === 'active') {
            this.isAdmin = true;
            this.showAdminPanel();
        }
    }
}

// Initialize calendar manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendarManager = new CalendarManager();
});

// Save admin session
document.addEventListener('beforeunload', () => {
    if (window.calendarManager && window.calendarManager.isAdmin) {
        sessionStorage.setItem('adminSession', 'active');
    }
});