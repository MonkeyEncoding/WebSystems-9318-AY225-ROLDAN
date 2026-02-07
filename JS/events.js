// Events page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.event-filters .filter-btn');
    const eventCards = document.querySelectorAll('.event-card-page');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filterCategory = this.dataset.category;

            // Filter events
            eventCards.forEach(card => {
                if (filterCategory === 'all' || card.dataset.category === filterCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// Show event modal with full details
function showEventModal(index) {
    const event = events[index];
    const content = document.getElementById('eventModalContent');
    
    const eventImages = [
        'ai-workshop', 'codefest', 'cybersecurity', 'webdev', 'quiz-bowl', 'mobile-dev'
    ];
    
    content.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <img src="images/events/${eventImages[index]}.jpg" alt="${event.title}" class="placeholder-img" style="width: 100%; height: 300px; clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);">
        </div>
        
        <h2 style="margin-bottom: 1rem;">${event.title}</h2>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
            <div>
                <p style="color: var(--razer-green); font-weight: 600; margin-bottom: 0.5rem;">📅 Date</p>
                <p style="color: var(--text-secondary);">${event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div>
                <p style="color: var(--razer-green); font-weight: 600; margin-bottom: 0.5rem;">🕐 Time</p>
                <p style="color: var(--text-secondary);">${event.time}</p>
            </div>
            
            <div>
                <p style="color: var(--razer-green); font-weight: 600; margin-bottom: 0.5rem;">📍 Location</p>
                <p style="color: var(--text-secondary);">${event.location}</p>
            </div>
            
            <div>
                <p style="color: var(--razer-green); font-weight: 600; margin-bottom: 0.5rem;">🏷️ Category</p>
                <p style="color: var(--text-secondary);">${event.category}</p>
            </div>
        </div>
        
        <h3 style="color: var(--razer-green); font-size: 1.5rem; margin-bottom: 1rem;">About This Event</h3>
        <p style="line-height: 1.8; margin-bottom: 2rem;">${event.description}</p>
        
        <div style="background: var(--razer-darker); padding: 2rem; border-left: 3px solid var(--razer-green); margin-bottom: 2rem;">
            <h3 style="color: var(--razer-green); margin-bottom: 1rem;">Event Highlights</h3>
            <ul style="list-style: none; color: var(--text-secondary); line-height: 2;">
                <li>✓ Hands-on learning experience</li>
                <li>✓ Industry expert speakers</li>
                <li>✓ Networking opportunities</li>
                <li>✓ Certificate of participation</li>
                <li>✓ Refreshments provided</li>
            </ul>
        </div>
        
        <button class="cta-button" style="width: 100%;" onclick="registerForEvent('${event.title}')">Register for This Event</button>
    `;
    
    document.getElementById('eventModal').classList.add('active');
}

// Register for event function
function registerForEvent(eventTitle) {
    alert(`Registration for "${eventTitle}" coming soon! Please check back later or contact us directly.`);
    closeModal('eventModal');
}