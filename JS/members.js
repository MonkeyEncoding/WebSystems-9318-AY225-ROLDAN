// Members page specific JavaScript

// Member filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sections = {
        'Executive': document.getElementById('executiveSection'),
        'Technical': document.getElementById('technicalSection'),
        'Events': document.getElementById('eventsTeamSection'),
        'Marketing': document.getElementById('marketingSection')
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filterRole = this.dataset.role;

            if (filterRole === 'all') {
                // Show all sections
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'block';
                });
            } else {
                // Hide all sections first
                Object.values(sections).forEach(section => {
                    if (section) section.style.display = 'none';
                });
                // Show only the selected section
                if (sections[filterRole]) {
                    sections[filterRole].style.display = 'block';
                }
            }

            // Scroll to top of members section
            window.scrollTo({
                top: document.querySelector('.page-section').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    });
});

// Show member modal with details
function showMemberModal(index) {
    const member = members[index];
    const content = document.getElementById('memberModalContent');
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem; align-items: start;">
            <div>
                <img src="images/members/${getMemberImageName(index)}.jpg" alt="${member.name}" class="placeholder-img" style="width: 100%; height: 300px; clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);">
            </div>
            <div>
                <h2 style="margin-bottom: 0.5rem;">${member.name}</h2>
                <p style="color: var(--razer-green); font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 600;">${member.role}</p>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;">${member.team} Team</p>
                
                <h3 style="color: var(--razer-green); font-size: 1.3rem; margin-bottom: 1rem;">About</h3>
                <p style="margin-bottom: 2rem; line-height: 1.8;">${member.bio}</p>
                
                <h3 style="color: var(--razer-green); font-size: 1.3rem; margin-bottom: 1rem;">Skills & Expertise</h3>
                <p style="line-height: 1.8;">${member.skills}</p>
            </div>
        </div>
    `;
    
    document.getElementById('memberModal').classList.add('active');
}

// Helper function to get member image name
function getMemberImageName(index) {
    const imageNames = [
        'president', 'vp', 'secretary', 'treasurer',
        'tech-lead', 'dev-manager',
        'events-head', 'events-coord',
        'marketing-lead', 'creative-director'
    ];
    return imageNames[index] || 'default';
}