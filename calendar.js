// Calendar functionality with monthly grid view
class CalendarManager {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('churchEvents')) || [];
        this.isAdmin = false;
        this.editingEventId = null;
        this.currentDate = new Date();
        
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

    saveEvent() {
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

        this.saveEvents();
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

    deleteEvent(eventId) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
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

    saveEvents() {
        localStorage.setItem('churchEvents', JSON.stringify(this.events));
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

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty-day';
            calendarDays.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if this day has events
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = this.events.filter(event => event.date === dateString);
            
            // Sort events by time (earliest first)
            dayEvents.sort((a, b) => {
                // Handle events without time (put them at the end)
                if (!a.time && !b.time) return 0;
                if (!a.time) return 1;
                if (!b.time) return -1;
                
                // Compare times
                return a.time.localeCompare(b.time);
            });

            if (dayEvents.length > 0) {
                dayElement.classList.add('has-events');
                
                // Show only first 3 events, add "more" indicator if there are more
                const maxVisibleEvents = 3;
                const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
                const hasMoreEvents = dayEvents.length > maxVisibleEvents;
                
                // Add event type indicators with proper spacing
                visibleEvents.forEach((event, index) => {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.className = `event-type-indicator ${event.type || 'special'}`;
                    eventIndicator.style.top = `${2 + (index * 1.5)}rem`; // Stack events vertically
                    
                    // Set text based on event type
                    let typeText = '';
                    switch(event.type) {
                        case 'fellowship':
                            typeText = 'Fellowship Meal';
                            break;
                        case 'service':
                            typeText = "Lord's Day Service";
                            break;
                        case 'special':
                        default:
                            typeText = 'Special Event';
                            break;
                    }
                    
                    eventIndicator.textContent = typeText;
                    dayElement.appendChild(eventIndicator);
                });

                // Add "more events" indicator if there are additional events
                if (hasMoreEvents) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.className = 'more-events-indicator';
                    moreIndicator.style.top = `${2 + (maxVisibleEvents * 1.5)}rem`;
                    moreIndicator.textContent = `+${dayEvents.length - maxVisibleEvents} more`;
                    dayElement.appendChild(moreIndicator);
                }

                // Add click handler for all users to see events
                dayElement.addEventListener('click', () => {
                    this.showDayEvents(dayEvents, dateString);
                });
            }

            // Highlight today
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayElement.classList.add('today');
            }

            calendarDays.appendChild(dayElement);
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

        const modal = document.createElement('div');
        modal.className = 'day-events-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Events for ${new Date(dateString).toLocaleDateString()}</h3>
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