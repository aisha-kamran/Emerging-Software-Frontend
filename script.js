// EMERGING SOFTWARE - FINAL JAVASCRIPT

// Changing Word Animation (DYNAMIC, AGILE, ADAPTIVE) - Now WHITE
const words = ['DYNAMIC', 'AGILE', 'ADAPTIVE'];
let currentWordIndex = 0;
const changingWord = document.getElementById('changing-word');

function changeWord() {
    if (changingWord) {
        changingWord.style.opacity = '0';
        
        setTimeout(() => {
            currentWordIndex = (currentWordIndex + 1) % words.length;
            changingWord.textContent = words[currentWordIndex];
            changingWord.style.opacity = '1';
        }, 500);
    }
}

// Change word every 3 seconds
setInterval(changeWord, 3000);

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});
// Navbar Scroll Effect 
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});
// Active Nav Link on Scroll
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 150;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href*=${sectionId}]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', scrollActive);

// Scroll Animation for Cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll('.service-card-new, .case-study-box-vertical, .stat-item');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Counter Animation for Stats
const counters = document.querySelectorAll('.stat-number');
const speed = 200;

const countUp = (counter) => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const increment = target / speed;

    if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(() => countUp(counter), 10);
    } else {
        if (target === 96) {
            counter.innerText = target + '%';
        } else if (target === 12) {
            counter.innerText = target + '+';
        } else if (target === 80) {
            counter.innerText = target + '+';
        } else if (target === 500) {
            counter.innerText = target + '+';
        }
    }
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    counter.innerText = '0';
    statsObserver.observe(counter);
});

// Contact Form Submission
const contactForms = document.querySelectorAll('.contact-form, .gravity-form');
contactForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        
        if (nameInput && emailInput) {
            const name = nameInput.value;
            const email = emailInput.value;
            
            alert(`Thank you ${name}!\n\nYour message has been sent successfully.\nWe'll get back to you at ${email} soon!`);
            
            form.reset();
        }
    });
});

// Parallax Effect on Hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
});

// Video Auto-pause on Scroll Away - EXCEPT HERO VIDEO
const videos = document.querySelectorAll('video:not(.hero-video):not(.page-background-video)');
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            entry.target.pause();
        } else {
            entry.target.play();
        }
    });
}, { threshold: 0.5 });

videos.forEach(video => {
    videoObserver.observe(video);
});

// Hero Video - Always Loop
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
    heroVideo.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });
}

// Page Background Video - Always Loop
const pageBgVideo = document.querySelector('.page-background-video');
if (pageBgVideo) {
    pageBgVideo.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    });
}

// Page Load Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Pause testimonial slider on hover
const testimonialTrack = document.querySelector('.testimonial-track');
if (testimonialTrack) {
    testimonialTrack.addEventListener('mouseenter', () => {
        testimonialTrack.style.animationPlayState = 'paused';
    });
    
    testimonialTrack.addEventListener('mouseleave', () => {
        testimonialTrack.style.animationPlayState = 'running';
    });
}

// Pause clients slider on hover
const clientsTrack = document.querySelector('.clients-track');
if (clientsTrack) {
    clientsTrack.addEventListener('mouseenter', () => {
        clientsTrack.style.animationPlayState = 'paused';
    });
    
    clientsTrack.addEventListener('mouseleave', () => {
        clientsTrack.style.animationPlayState = 'running';
    });
}

console.log('🚀 EMERGING SOFTWARE - Website Loaded Successfully!');

// Animated Boxes Scroll Animation
const animatedBoxes = document.querySelectorAll('.animated-box');

const boxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

animatedBoxes.forEach(box => {
    boxObserver.observe(box);
});
// Why Choose Boxes Animation
const whyBoxes = document.querySelectorAll('.why-box');

const whyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

whyBoxes.forEach(box => {
    whyObserver.observe(box);
});


// FAQ Accordion Functionality
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Close all other items
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle current item
        item.classList.toggle('active');
    });
});
// Homepage Services Animation
const serviceCards = document.querySelectorAll('.service-card-new');

const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 150);
        }
    });
}, { threshold: 0.2 });

serviceCards.forEach(card => {
    serviceObserver.observe(card);
});
// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    // Show button when scrolling down
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
// Stacking Boxes Scroll Animation - Simple & Clean
const stackBoxes = document.querySelectorAll('.stack-box');


// Pricing Modal Form Functionality
function openModal(packageName) {
    const modal = document.getElementById('packageModal');
    const packageInput = document.getElementById('packageNameInput');
    
    if (modal && packageInput) {
        packageInput.value = packageName;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeModal() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    alert('Thank you! Your request has been submitted successfully. We will contact you soon!');
    
    closeModal();
    event.target.reset();
}

// Attach click events to all BUY NOW buttons
document.addEventListener('DOMContentLoaded', () => {
    const buyButtons = document.querySelectorAll('.pricing-btn');
    
    buyButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const packageNames = ['STARTUP', 'SMALL BUSINESS', 'CORPORATE'];
            openModal(packageNames[index]);
        });
    });
});



// About Us Page - Collapsible Sections
const collapsibleHeaders = document.querySelectorAll('.collapsible-header');

collapsibleHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        // Close all items
        document.querySelectorAll('.collapsible-item').forEach(i => {
            i.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    });
});


