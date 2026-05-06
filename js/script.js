lucide.createIcons();

document.getElementById('hamburger').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('open');
    
    const icon = document.querySelector('#hamburger i');
    icon.setAttribute('data-lucide', mobileMenu.classList.contains('open') ? 'x' : 'menu');
    lucide.createIcons();
});


function sendMessage() {
    alert('Message sent!');
}

document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(element => {
        observer.observe(element);
    });
});