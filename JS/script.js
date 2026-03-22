// Data Storage
const members = [
    { name: 'Alex Rivera', role: 'President', team: 'Executive', bio: 'Leading JPCS with a vision for innovation and excellence. Passionate about AI and machine learning.', skills: 'Leadership, Python, Machine Learning' },
    { name: 'Maria Santos', role: 'Vice President', team: 'Executive', bio: 'Supporting organizational growth and member engagement. Expert in full-stack development.', skills: 'Management, React, Node.js' },
    { name: 'John Chen', role: 'Secretary', team: 'Executive', bio: 'Managing documentation and communications. Specializes in cybersecurity.', skills: 'Organization, Security, Linux' },
    { name: 'Sarah Lee', role: 'Treasurer', team: 'Executive', bio: 'Overseeing financial operations and budgeting. Data science enthusiast.', skills: 'Finance, Data Analysis, Excel' },
    { name: 'Miguel Torres', role: 'Tech Lead', team: 'Technical', bio: 'Heading technical projects and workshops. Cloud computing specialist.', skills: 'AWS, Docker, Kubernetes' },
    { name: 'Lisa Wong', role: 'Dev Manager', team: 'Technical', bio: 'Coordinating development teams and code reviews. Mobile development expert.', skills: 'Flutter, Swift, Kotlin' },
    { name: 'David Kim', role: 'Events Head', team: 'Events', bio: 'Planning and executing amazing events and activities. Event management pro.', skills: 'Planning, Coordination, Public Speaking' },
    { name: 'Emma Garcia', role: 'Events Coordinator', team: 'Events', bio: 'Supporting event logistics and participant engagement. Detail-oriented organizer.', skills: 'Logistics, Communication, Teamwork' },
    { name: 'Ryan Patel', role: 'Marketing Lead', team: 'Marketing', bio: 'Driving marketing strategies and brand awareness. Digital marketing specialist.', skills: 'Social Media, Content Creation, SEO' },
    { name: 'Sophie Cruz', role: 'Creative Director', team: 'Marketing', bio: 'Creating visual content and brand identity. Graphic design expert.', skills: 'Photoshop, Illustrator, UI/UX' }
];

const events = [
    { title: 'AI & Machine Learning Workshop', date: new Date('2026-02-15'), category: 'Workshop', description: 'Hands-on workshop covering fundamentals of AI and ML with practical projects using Python and TensorFlow.', location: 'CS Building Lab 3', time: '2:00 PM - 6:00 PM' },
    { title: 'CodeFest 2026', date: new Date('2026-02-22'), category: 'Hackathon', description: '24-hour hackathon with amazing prizes! Build innovative solutions to real-world problems.', location: 'University Gymnasium', time: 'Feb 22, 8:00 AM - Feb 23, 8:00 AM' },
    { title: 'Cybersecurity Fundamentals', date: new Date('2026-03-05'), category: 'Seminar', description: 'Learn about network security, ethical hacking, and protecting digital assets from industry experts.', location: 'Auditorium A', time: '1:00 PM - 4:00 PM' },
    { title: 'Web Dev Bootcamp', date: new Date('2026-03-12'), category: 'Workshop', description: 'Complete guide to modern web development: HTML, CSS, JavaScript, React, and deployment.', location: 'CS Building Lab 1', time: '9:00 AM - 5:00 PM' },
    { title: 'Tech Quiz Bowl', date: new Date('2026-03-20'), category: 'Competition', description: 'Test your knowledge in programming, algorithms, and computer science fundamentals. Win prizes!', location: 'Conference Room B', time: '3:00 PM - 6:00 PM' },
    { title: 'Mobile App Development', date: new Date('2026-04-02'), category: 'Workshop', description: 'Build cross-platform mobile apps using Flutter. From basics to app store deployment.', location: 'CS Building Lab 2', time: '1:00 PM - 6:00 PM' },
    { title: 'Industry Talk: Career in Tech', date: new Date('2026-04-10'), category: 'Seminar', description: 'Hear from successful tech professionals about career paths, tips, and industry insights.', location: 'Main Auditorium', time: '2:00 PM - 5:00 PM' },
    { title: 'Game Dev Jam', date: new Date('2026-04-18'), category: 'Hackathon', description: '48-hour game development competition. Create awesome games and showcase your creativity!', location: 'CS Building', time: 'Apr 18, 9:00 AM - Apr 20, 9:00 AM' }
];

// LocalStorage for form progress
const FORM_STORAGE_KEY = 'jpcs_registration_form';

// Navigation
function navigateTo(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Close mobile menu
    document.getElementById('navMenu').classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// Render Members
function renderMembers(filterRole = 'all') {
    const grid = document.getElementById('membersGrid');
    const filteredMembers = filterRole === 'all' 
        ? members 
        : members.filter(m => m.team === filterRole);
    
    grid.innerHTML = filteredMembers.map(member => `
        <div class="member-card" onclick="showMemberDetails(${members.indexOf(member)})">
            <div class="member-avatar">${member.name.split(' ').map(n => n[0]).join('')}</div>
            <h3>${member.name}</h3>
            <p class="role">${member.role}</p>
        </div>
    `).join('');
}

function showMemberDetails(index) {
    const member = members[index];
    const content = document.getElementById('memberModalContent');
    content.innerHTML = `
        <div class="member-avatar" style="margin-bottom: 2rem;">${member.name.split(' ').map(n => n[0]).join('')}</div>
        <h2>${member.name}</h2>
        <p style="color: var(--razer-green); font-size: 1.3rem; margin-bottom: 1.5rem;">${member.role} - ${member.team} Team</p>
        <p style="margin-bottom: 1.5rem;">${member.bio}</p>
        <p><strong style="color: var(--razer-green);">Skills:</strong> ${member.skills}</p>
    `;
    const modal = document.getElementById('memberModal');
    modal.classList.add('active', 'show');
}

// Member Filters
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#members .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#members .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderMembers(this.dataset.role);
        });
    });
});

// Render Events
function renderEvents(filterCategory = 'all') {
    const list = document.getElementById('eventsList');
    const now = new Date();
    const filteredEvents = filterCategory === 'all' 
        ? events 
        : events.filter(e => e.category === filterCategory);
    
    // Sort by date
    const sortedEvents = filteredEvents.sort((a, b) => a.date - b.date);
    
    list.innerHTML = sortedEvents.map(event => {
        const isPast = event.date < now;
        return `
            <div class="event-card" style="${isPast ? 'opacity: 0.6;' : ''}">
                <div class="event-date">
                    <div class="day">${event.date.getDate()}</div>
                    <div class="month">${event.date.toLocaleString('en-US', { month: 'short' })}</div>
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <span class="category">${event.category}</span>
                    <p>${event.description}</p>
                </div>
                <button class="event-action" onclick="showEventDetails(${events.indexOf(event)})">
                    ${isPast ? 'View Details' : 'Learn More'}
                </button>
            </div>
        `;
    }).join('');
}

function showEventDetails(index) {
    const event = events[index];
    const content = document.getElementById('eventModalContent');
    content.innerHTML = `
        <h2>${event.title}</h2>
        <p style="color: var(--razer-green); margin-bottom: 1rem;">
            <strong>${event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </p>
        <p style="margin-bottom: 1rem;"><strong style="color: var(--razer-green);">Category:</strong> ${event.category}</p>
        <p style="margin-bottom: 1rem;"><strong style="color: var(--razer-green);">Time:</strong> ${event.time}</p>
        <p style="margin-bottom: 1rem;"><strong style="color: var(--razer-green);">Location:</strong> ${event.location}</p>
        <p>${event.description}</p>
    `;
    const modal = document.getElementById('eventModal');
    modal.classList.add('active', 'show');
}

// Event Filters
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('#events .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#events .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderEvents(this.dataset.category);
        });
    });
});

// Form Validation and LocalStorage
function setupForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input, select, textarea');
    
    // Load saved form data
    if (formId === 'registrationForm') {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = data[key];
            });
        }
    }
    
    // Save form data on input
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (formId === 'registrationForm') {
                const formData = {};
                inputs.forEach(inp => {
                    if (inp.name) formData[inp.name] = inp.value;
                });
                localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
            }
            
            // Clear error on valid input
            if (this.value.trim() !== '') {
                this.parentElement.classList.remove('invalid');
            }
        });
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        inputs.forEach(input => {
            if (input.hasAttribute('required') && input.value.trim() === '') {
                input.parentElement.classList.add('invalid');
                isValid = false;
            } else if (input.type === 'email' && input.value.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.parentElement.classList.add('invalid');
                    isValid = false;
                } else {
                    input.parentElement.classList.remove('invalid');
                }
            } else {
                input.parentElement.classList.remove('invalid');
            }
        });
        
        if (isValid) {
            // Clear saved form data
            if (formId === 'registrationForm') {
                localStorage.removeItem(FORM_STORAGE_KEY);
            }
            
            // Success message
            alert('Form submitted successfully! We will contact you soon.');
            form.reset();
        }
    });
}

// Modal Controls
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active', 'show');
}

// Member Modal - Alias for showMemberDetails
function showMemberModal(index) {
    showMemberDetails(index);
}

// Event Modal - Alias for showEventDetails
function showEventModal(index) {
    showEventDetails(index);
}

// Toggle FAQ
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    if (faqItem) {
        faqItem.classList.toggle('active');
    }
}

// Scroll to Form
function scrollToForm() {
    const form = document.getElementById('registrationForm') || document.getElementById('membershipForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Close modal on background click
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active', 'show');
            }
        });
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderMembers();
    renderEvents();
    setupForm('registrationForm');
    setupForm('contactForm');
});

// Handle navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
});