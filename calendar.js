// Calendar functionality
class CalendarManager {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('churchEvents')) || [];
        this.isAdmin = false;
        this.editingEventId = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderEvents();
        this.checkAdminStatus();
    }

    bindEvents() {
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
    }

    toggleAdmin() {
        if (!this.isAdmin) {
            const password = prompt('Enter admin password:');
            if (password === 'trinity2024') { // Simple password protection
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
    }

    saveEvent() {
        const formData = new FormData(document.getElementById('event-form'));
        const eventData = {
            id: this.editingEventId || Date.now(),
            title: formData.get('title'),
            date: formData.get('date'),
            time: formData.get('time'),
            location: formData.get('location'),
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
        this.renderEvents();
        this.hideAdminPanel();
    }

    cancelEdit() {
        document.getElementById('event-form').reset();
        this.editingEventId = null;
        document.getElementById('cancel-edit').style.display = 'none';
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (event) {
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-time').value = event.time;
            document.getElementById('event-location').value = event.location;
            document.getElementById('event-description').value = event.description;
            
            this.editingEventId = eventId;
            document.getElementById('cancel-edit').style.display = 'inline-block';
            document.getElementById('admin-panel').style.display = 'block';
        }
    }

    deleteEvent(eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== eventId);
            this.saveEvents();
            this.renderEvents();
        }
    }

    saveEvents() {
        localStorage.setItem('churchEvents', JSON.stringify(this.events));
    }

    renderEvents() {
        const eventsList = document.getElementById('events-list');
        
        if (this.events.length === 0) {
            eventsList.innerHTML = '<p>No events scheduled at this time.</p>';
            return;
        }

        // Sort events by date
        const sortedEvents = this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        eventsList.innerHTML = sortedEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const adminControls = this.isAdmin ? `
                <div class="event-admin-controls">
                    <button onclick="calendarManager.editEvent(${event.id})" class="edit-btn">Edit</button>
                    <button onclick="calendarManager.deleteEvent(${event.id})" class="delete-btn">Delete</button>
                </div>
            ` : '';

            return `
                <div class="event-item">
                    <div class="event-header">
                        <h3>${event.title}</h3>
                        ${adminControls}
                    </div>
                    <div class="event-details">
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        ${event.time ? `<p><strong>Time:</strong> ${event.time}</p>` : ''}
                        ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
                        ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
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
