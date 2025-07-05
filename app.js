// Personal CRM Application - Main JavaScript File

class PersonalCRM {
    constructor() {
        this.contacts = [...window.mockData.contacts];
        this.notes = [...window.mockData.notes];
        this.reminders = [...window.mockData.reminders];
        this.activeTab = 'home';
        this.currentTheme = 'light';
        this.currentNoteData = {
            contactId: '',
            content: '',
            type: 'note',
            sentiment: 'neutral',
            tags: []
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.updateWelcomeMessage();
        this.renderActiveTab();
        this.updateStats();
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Theme toggle
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
            });
        });

        // Add note button
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openNoteModal();
        });

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('cancelNote').addEventListener('click', () => {
            this.closeNoteModal();
        });

        document.getElementById('saveNote').addEventListener('click', () => {
            this.saveNote();
        });

        // Modal form controls
        this.setupModalEventListeners();

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterContacts();
        });

        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.filterContacts();
        });

        // Close modal on backdrop click
        document.getElementById('noteModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeNoteModal();
            }
        });
    }

    setupModalEventListeners() {
        // Type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentNoteData.type = e.currentTarget.dataset.type;
            });
        });

        // Sentiment buttons
        document.querySelectorAll('.sentiment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.sentiment-btn').forEach(b => {
                    b.classList.remove('active', 'positive', 'neutral', 'needs-attention');
                });
                const sentiment = e.currentTarget.dataset.sentiment;
                e.currentTarget.classList.add('active', sentiment);
                this.currentNoteData.sentiment = sentiment;
            });
        });

        // Tag input
        document.getElementById('newTag').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTag();
            }
        });

        document.getElementById('addTagBtn').addEventListener('click', () => {
            this.addTag();
        });

        // Note content
        document.getElementById('noteContent').addEventListener('input', (e) => {
            this.currentNoteData.content = e.target.value;
            this.updateSaveButton();
        });

        // Contact selection
        document.getElementById('noteContact').addEventListener('change', (e) => {
            this.currentNoteData.contactId = e.target.value;
            this.updateSaveButton();
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    updateWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Good morning';
        if (hour >= 12 && hour < 18) greeting = 'Good afternoon';
        else if (hour >= 18) greeting = 'Good evening';

        document.getElementById('welcomeMessage').textContent = greeting;
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        this.renderActiveTab();
    }

    renderActiveTab() {
        switch (this.activeTab) {
            case 'home':
                this.renderHomeTab();
                break;
            case 'contacts':
                this.renderContactsTab();
                break;
            case 'timeline':
                this.renderTimelineTab();
                break;
        }
    }

    updateStats() {
        const totalContacts = this.contacts.length;
        const starredContacts = this.contacts.filter(c => c.starred).length;
        const pendingReminders = this.reminders.filter(r => !r.completed).length;

        document.getElementById('totalContacts').textContent = totalContacts;
        document.getElementById('starredContacts').textContent = starredContacts;
        document.getElementById('pendingReminders').textContent = pendingReminders;
    }

    renderHomeTab() {
        this.renderTodayReminders();
        this.renderStarredPeople();
        this.renderRecentActivity();
    }

    renderTodayReminders() {
        const container = document.getElementById('todayReminders');
        const todayReminders = this.reminders.filter(r => !r.completed);

        if (todayReminders.length === 0) {
            container.innerHTML = '<p class="empty-state">All caught up! No reminders for today.</p>';
            return;
        }

        container.innerHTML = todayReminders.map(reminder => `
            <div class="reminder-item">
                <button class="reminder-checkbox" onclick="app.completeReminder('${reminder.id}')"></button>
                <div class="reminder-content">
                    <div class="reminder-name">${reminder.contactName}</div>
                    <div class="reminder-message">${reminder.message}</div>
                    <div class="reminder-date">${this.formatDate(reminder.date)}</div>
                </div>
            </div>
        `).join('');
    }

    renderStarredPeople() {
        const container = document.getElementById('starredPeople');
        const starredContacts = this.contacts.filter(c => c.starred);

        if (starredContacts.length === 0) {
            container.innerHTML = '<p class="empty-state">Star your important contacts to see them here.</p>';
            return;
        }

        container.innerHTML = starredContacts.map(contact => `
            <div class="starred-item" onclick="app.viewContact('${contact.id}')">
                <div class="starred-avatar">${this.getInitials(contact.name)}</div>
                <div class="starred-info">
                    <div class="starred-name">${contact.name}</div>
                    <div class="starred-relationship">${contact.relationship}</div>
                </div>
                <div class="starred-date">${contact.lastContact ? this.formatDate(contact.lastContact) : 'No contact'}</div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        const recentContacts = this.contacts
            .filter(c => c.lastContact)
            .sort((a, b) => (b.lastContact?.getTime() || 0) - (a.lastContact?.getTime() || 0))
            .slice(0, 5);

        container.innerHTML = recentContacts.map(contact => `
            <div class="activity-item" onclick="app.viewContact('${contact.id}')">
                <div class="activity-left">
                    <div class="activity-avatar">${this.getInitials(contact.name)}</div>
                    <div>
                        <div class="activity-name">${contact.name}</div>
                        <div class="activity-label">Last contact</div>
                    </div>
                </div>
                <div class="activity-date">${contact.lastContact ? this.formatDate(contact.lastContact) : 'Never'}</div>
            </div>
        `).join('');
    }

    renderContactsTab() {
        this.populateContactSelect();
        this.filterContacts();
    }

    filterContacts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const filterValue = document.getElementById('filterSelect').value;

        let filteredContacts = this.contacts.filter(contact => {
            const matchesSearch = contact.name.toLowerCase().includes(searchTerm) ||
                                contact.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesFilter = filterValue === 'all' ||
                                (filterValue === 'starred' && contact.starred) ||
                                (filterValue === 'needs-attention' && contact.sentiment === 'needs-attention');

            return matchesSearch && matchesFilter;
        });

        this.renderContactsGrid(filteredContacts);
        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const filterSelect = document.getElementById('filterSelect');
        const allCount = this.contacts.length;
        const starredCount = this.contacts.filter(c => c.starred).length;
        const needsAttentionCount = this.contacts.filter(c => c.sentiment === 'needs-attention').length;

        filterSelect.innerHTML = `
            <option value="all">All People (${allCount})</option>
            <option value="starred">Starred (${starredCount})</option>
            <option value="needs-attention">Needs Attention (${needsAttentionCount})</option>
        `;
    }

    renderContactsGrid(contacts) {
        const container = document.getElementById('contactsGrid');

        if (contacts.length === 0) {
            container.innerHTML = `
                <div class="empty-contacts">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </div>
                    <h3 class="empty-title">No people found</h3>
                    <p class="empty-description">Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        container.innerHTML = contacts.map(contact => this.renderContactCard(contact)).join('');
    }

    renderContactCard(contact) {
        const displayTags = contact.tags.slice(0, 3);
        const remainingTags = contact.tags.length - 3;

        return `
            <div class="contact-card" onclick="app.viewContact('${contact.id}')">
                <div class="contact-header">
                    <div class="contact-left">
                        <div class="contact-avatar">${this.getInitials(contact.name)}</div>
                        <div>
                            <div class="contact-name">${contact.name}</div>
                            <div class="contact-relationship">${contact.relationship}</div>
                        </div>
                    </div>
                    <button class="star-btn ${contact.starred ? 'starred' : ''}" onclick="event.stopPropagation(); app.toggleStar('${contact.id}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                    </button>
                </div>

                <div class="contact-info">
                    ${contact.email ? `
                        <div class="contact-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>${contact.email}</span>
                        </div>
                    ` : ''}
                    ${contact.phone ? `
                        <div class="contact-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            <span>${contact.phone}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="contact-tags">
                    ${displayTags.map(tag => `<span class="contact-tag">${tag}</span>`).join('')}
                    ${remainingTags > 0 ? `<span class="contact-tag more">+${remainingTags} more</span>` : ''}
                </div>

                <div class="contact-footer">
                    <div class="contact-status">
                        <div class="sentiment-dot ${contact.sentiment}"></div>
                        <span class="contact-last-contact">Last contact: ${this.formatLastContact(contact.lastContact)}</span>
                    </div>
                    <div class="contact-notes">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>${contact.notes.length}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderTimelineTab() {
        const container = document.getElementById('timelineContent');
        const sortedNotes = [...this.notes].sort((a, b) => b.date.getTime() - a.date.getTime());

        if (sortedNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-timeline">
                    <div class="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <h3 class="empty-title">No memories yet</h3>
                    <p class="empty-description">Start adding notes about your interactions to build your memory feed</p>
                </div>
            `;
            return;
        }

        container.innerHTML = sortedNotes.map(note => this.renderTimelineItem(note)).join('');
    }

    renderTimelineItem(note) {
        const contact = this.contacts.find(c => c.id === note.contactId);
        const contactName = contact ? contact.name : 'Unknown Contact';

        const typeIcons = {
            note: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>`,
            call: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>`,
            email: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
            </svg>`,
            meeting: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>`
        };

        return `
            <div class="timeline-item ${note.sentiment}">
                <div class="timeline-header-content">
                    <div class="timeline-icon ${note.type}">
                        ${typeIcons[note.type]}
                    </div>
                    <div class="timeline-content-area">
                        <div class="timeline-meta">
                            <div>
                                <div class="timeline-contact-name">${contactName}</div>
                                <div class="timeline-type-date">
                                    <span class="capitalize">${note.type}</span>
                                    <span>•</span>
                                    <span>${this.formatDate(note.date)}</span>
                                </div>
                            </div>
                            <div class="timeline-sentiment ${note.sentiment}"></div>
                        </div>
                        
                        <p class="timeline-text">${note.content}</p>
                        
                        ${note.tags.length > 0 ? `
                            <div class="timeline-tags">
                                ${note.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Modal functions
    openNoteModal() {
        this.resetNoteForm();
        this.populateContactSelect();
        document.getElementById('noteModal').classList.add('active');
    }

    closeNoteModal() {
        document.getElementById('noteModal').classList.remove('active');
        this.resetNoteForm();
    }

    resetNoteForm() {
        this.currentNoteData = {
            contactId: '',
            content: '',
            type: 'note',
            sentiment: 'neutral',
            tags: []
        };

        document.getElementById('noteContact').value = '';
        document.getElementById('noteContent').value = '';
        
        // Reset type buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'note');
        });

        // Reset sentiment buttons
        document.querySelectorAll('.sentiment-btn').forEach(btn => {
            btn.classList.remove('active', 'positive', 'neutral', 'needs-attention');
            if (btn.dataset.sentiment === 'neutral') {
                btn.classList.add('active', 'neutral');
            }
        });

        // Clear tags
        document.getElementById('noteTags').innerHTML = '';
        document.getElementById('newTag').value = '';

        this.updateSaveButton();
    }

    populateContactSelect() {
        const select = document.getElementById('noteContact');
        select.innerHTML = '<option value="">Select a person...</option>' +
            this.contacts.map(contact => 
                `<option value="${contact.id}">${contact.name}</option>`
            ).join('');
    }

    addTag() {
        const input = document.getElementById('newTag');
        const tag = input.value.trim();
        
        if (tag && !this.currentNoteData.tags.includes(tag)) {
            this.currentNoteData.tags.push(tag);
            input.value = '';
            this.renderNoteTags();
        }
    }

    removeTag(tag) {
        this.currentNoteData.tags = this.currentNoteData.tags.filter(t => t !== tag);
        this.renderNoteTags();
    }

    renderNoteTags() {
        const container = document.getElementById('noteTags');
        container.innerHTML = this.currentNoteData.tags.map(tag => `
            <span class="tag-item">
                <span>${tag}</span>
                <button class="tag-remove" onclick="app.removeTag('${tag}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </span>
        `).join('');
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveNote');
        const isValid = this.currentNoteData.contactId && this.currentNoteData.content.trim();
        saveBtn.disabled = !isValid;
    }

    async saveNote() {
        if (!this.currentNoteData.contactId || !this.currentNoteData.content.trim()) return;

        const saveBtn = document.getElementById('saveNote');
        saveBtn.classList.add('saving');
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
            </svg>
            Saving...
        `;

        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newNote = {
            id: Math.random().toString(36).substr(2, 9),
            contactId: this.currentNoteData.contactId,
            content: this.currentNoteData.content.trim(),
            date: new Date(),
            tags: [...this.currentNoteData.tags],
            sentiment: this.currentNoteData.sentiment,
            type: this.currentNoteData.type
        };

        this.notes.push(newNote);

        // Update contact's last contact date
        const contactIndex = this.contacts.findIndex(c => c.id === this.currentNoteData.contactId);
        if (contactIndex !== -1) {
            this.contacts[contactIndex].lastContact = new Date();
            this.contacts[contactIndex].notes.push(newNote);
        }

        this.closeNoteModal();
        this.updateStats();
        this.renderActiveTab();
    }

    // Contact actions
    toggleStar(contactId) {
        const contactIndex = this.contacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
            this.contacts[contactIndex].starred = !this.contacts[contactIndex].starred;
            this.updateStats();
            this.renderActiveTab();
        }
    }

    viewContact(contactId) {
        // In a real app, this would navigate to a contact detail page
        console.log('Viewing contact:', contactId);
    }

    completeReminder(reminderId) {
        const reminderIndex = this.reminders.findIndex(r => r.id === reminderId);
        if (reminderIndex !== -1) {
            this.reminders[reminderIndex].completed = true;
            this.updateStats();
            this.renderActiveTab();
        }
    }

    // Utility functions
    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        }).format(date);
    }

    formatLastContact(date) {
        if (!date) return 'No recent contact';
        
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return `${Math.floor(days / 30)} months ago`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PersonalCRM();
});