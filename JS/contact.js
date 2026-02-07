// Contact page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        
        // Clear error on input
        inputs.forEach(input => {
            input.addEventListener('input', function() {
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
                const name = document.getElementById('contactName').value;
                const email = document.getElementById('contactEmail').value;
                const subject = document.getElementById('subject').value;
                const message = document.getElementById('contactMessage').value;
                
                // Success message
                alert(`Thank you for contacting us, ${name}! We've received your message and will respond to ${email} within 24-48 hours.`);
                form.reset();
            } else {
                // Scroll to first error
                const firstError = form.querySelector('.form-group.invalid');
                if (firstError) {
                    window.scrollTo({
                        top: firstError.offsetTop - 150,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }
});

// Map click handler
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer) {
        mapContainer.addEventListener('click', function() {
            // Open Google Maps in new tab (replace with actual coordinates)
            window.open('https://maps.google.com/?q=University+Campus+Quezon+City', '_blank');
        });
    }
});