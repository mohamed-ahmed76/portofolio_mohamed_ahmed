(function(){
'use strict';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const body = document.body;

/* ---------- Loading screen ---------- */
const loader = document.getElementById('loader');
function finishLoading(){
  loader.classList.add('hidden');
  body.classList.remove('is-loading');
  document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
}
window.addEventListener('load', () => setTimeout(finishLoading, reduceMotion ? 150 : 1900));
setTimeout(finishLoading, 4500);

/* ---------- Theme toggle (in-memory for this session) ---------- */
const html = document.documentElement;
let theme = html.getAttribute('data-theme') || 'dark';
document.getElementById('themeToggle').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', theme);
});

/* ---------- Mobile menu ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function closeMobileMenu(){
  if (!hamburger || !mobileMenu) return;

  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded','false');
  mobileMenu.classList.remove('open');
  body.style.overflow = '';
}

if (hamburger && mobileMenu) {

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();

    const isOpen = mobileMenu.classList.toggle('open');

    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));

    body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.addEventListener('click', (event) => {
    if (!mobileMenu.classList.contains('open')) return;

    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = hamburger.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      mobileMenu.classList.contains('open')
    ) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (
      window.innerWidth > 1100 &&
      mobileMenu.classList.contains('open')
    ) {
      closeMobileMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileMenu);
  });

}

/* ---------- Smooth scroll with fixed-nav offset ---------- */
const nav = document.getElementById('nav');
function scrollToTarget(target){
  const el = document.querySelector(target);
  if(!el) return;
  const offset = nav.offsetHeight + 12;
  const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({top, behavior: reduceMotion ? 'auto' : 'smooth'});
}
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if(href && href.charAt(0) === '#' && href.length > 1){
      e.preventDefault();
      scrollToTarget(href);
      closeMobileMenu();
    }
  });
});
document.querySelectorAll('[data-scroll-target]').forEach(btn => {
  btn.addEventListener('click', () => scrollToTarget(btn.getAttribute('data-scroll-target')));
});

/* ---------- Nav scrolled state + back-to-top visibility ---------- */
const backToTop = document.getElementById('backToTop');
let ticking = false;
function onScroll(){
  nav.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('visible', window.scrollY > 560);
  ticking = false;
}
window.addEventListener('scroll', () => { if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } });
onScroll();
backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior: reduceMotion ? 'auto' : 'smooth'}));

/* ---------- Active nav-link detection ---------- */
const navAnchorLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const observedSections = Array.from(navAnchorLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const id = '#' + entry.target.id;
      navAnchorLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    }
  });
}, {rootMargin:'-42% 0px -50% 0px', threshold:0});
observedSections.forEach(s => sectionObserver.observe(s));

/* ---------- Hero typing effect ---------- */
const roles = ['UI/UX Designer','Product Designer','Creative Thinker'];
const roleEl = document.getElementById('roleText');
let rIndex = 0, cIndex = 0, deleting = false;
function typeTick(){
  const word = roles[rIndex];
  if(!deleting){
    cIndex++;
    roleEl.textContent = word.slice(0, cIndex);
    if(cIndex === word.length){ deleting = true; setTimeout(typeTick, 1700); return; }
  } else {
    cIndex--;
    roleEl.textContent = word.slice(0, cIndex);
    if(cIndex === 0){ deleting = false; rIndex = (rIndex+1) % roles.length; setTimeout(typeTick, 350); return; }
  }
  setTimeout(typeTick, deleting ? 45 : 85);
}
if(roleEl && !reduceMotion){ roleEl.textContent = ''; setTimeout(typeTick, 1200); }

/* ---------- Mouse-follow gold glow (desktop only) ---------- */
const cursorGlow = document.getElementById('cursorGlow');
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(supportsHover && !reduceMotion){
  let gx = window.innerWidth/2, gy = window.innerHeight/2, tx = gx, ty = gy;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursorGlow.classList.add('active'); });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
  (function raf(){
    gx += (tx-gx)*0.12; gy += (ty-gy)*0.12;
    cursorGlow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
    requestAnimationFrame(raf);
  })();
}

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Animated stat counters ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if(reduceMotion){ el.textContent = target; counterObserver.unobserve(el); return; }
    const duration = 1600;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now-start)/duration, 1);
      const eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(eased*target);
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, {threshold:0.6});
document.querySelectorAll('.stat-num').forEach(c => counterObserver.observe(c));

/* ---------- Project case-study modal ---------- */
const projectsData = {
  gparts:{cat:'Mobile App', title:'G-Parts-Pro Application', desc:'Conducted competitive audits and designed high-fidelity splash screens, home layouts, and color themes focused on spare part catalog navigation. Engineered simplified search and filter user flows to reduce navigation drop-off. I used Figma and ChatGPT to shape the direction, refine the flow, and prototype a clearer mobile shopping experience for a German automotive spare parts app.', highlights:['Competitive audit and user-flow analysis','High-fidelity splash, home, and catalog layouts','Simplified search and filter UX to reduce navigation drop-off'], tools:'Figma, ChatGPT', caseStudyUrl:'https://drive.google.com/drive/folders/1Re-CkhfIURqI_3IOv-rGDy13EBk14hIr?usp=sharing'},
  vitalife:{cat:'Health Tech', title:'VitaLife Application', desc:'Designed an end-to-end mobile app UI connecting seamlessly with smartwatches and smart rings to monitor real-time vital health indicators including heart rate, blood oxygen, sleep tracking, and body temperature. Formulated intuitive dashboard data visualizations, clear metrics hierarchy, and rapid-alert user flows for critical health updates. I used Figma, ChatGPT, and NotebookLM to shape the system, refine the information hierarchy, and prototype a smarter wellness experience.', highlights:['Smart wearable health data integration','Dashboard metrics and alert UX for vital signs','Decision-ready visual hierarchy and wellness flow design'], tools:'Figma, ChatGPT, NotebookLM', caseStudyUrl:'https://drive.google.com/drive/folders/1G88x_pyvFfocfavWpzQea1O0UVJ-wfba?usp=sharing'},
  finto:{cat:'Mobile App', title:'Finto', desc:"A mobile banking app that turns everyday spending into clear, human insight. The brief called for a companion app that made a full-service bank feel calm instead of overwhelming — fewer numbers, more meaning.", highlights:['Simplified onboarding from 9 steps to 3','Custom spending-insight visualizations tested with 40 users','Design system shared across iOS and Android teams'], tools:'Figma, Protopie, Maze'},
  luxe:{cat:'E-commerce', title:'Luxe & Co', desc:'A boutique e-commerce platform balancing editorial storytelling with fast, frictionless checkout for a growing lifestyle brand.', highlights:['Redesigned product pages lifted add-to-cart rate','One-page checkout reduced drop-off significantly','Built a reusable component library for the marketing team'], tools:'Figma, Shopify, Klaviyo'},
  alasala:{cat:'Restaurant Website', title:'El-Dewan Restaurant Landing Page', desc:'Designed an Arabic-first, Right-to-Left (RTL) responsive landing page for a traditional Arabic restaurant, focusing on brand identity, food presentation, and visual hierarchy. Formulated user journeys for table reservations and food ordering, optimizing navigation and CTA placements for Arabic-speaking users. I used Figma, ChatGPT, and NotebookLM to shape the direction, refine the content flow, and build a more culturally aligned digital experience.', highlights:['Arabic-first RTL responsive layout','Reservation and ordering journeys optimized for local users','Brand-focused storytelling and food-led visual hierarchy'], tools:'Figma, ChatGPT, NotebookLM', caseStudyUrl:''},
  hirect:{cat:'Dashboard Design', title:'Dashboard Design — Hirect', desc:'Designing the Hirect Dashboard was an important milestone in my journey as a UI/UX Designer. This project was my first real experience designing a complete dashboard while I was still learning and developing my design skills. The goal was to create a clear and practical dashboard for a recruitment platform, helping users easily understand important information, manage their activities, and navigate through the platform without unnecessary complexity. As I worked on the project, I focused on understanding how dashboards organize large amounts of information and how visual hierarchy, spacing, typography, and components can make complex data easier to understand. Since this was my first dashboard, the process was also a learning experience. I explored different ways to structure the interface, organize content, create reusable components, and maintain consistency across the different sections of the dashboard. One of the biggest lessons I learned from this project was that good dashboard design is not only about making the interface look modern. It is about making information easy to scan, actions easy to find, and the overall experience simple and intuitive. Hirect represents one of the projects that helped me move from learning UI/UX concepts to applying them in a real design project. It gave me a better understanding of dashboard design, information architecture, visual hierarchy, and the importance of designing with the user’s needs in mind.', highlights:['First full dashboard concept and UI system','Data hierarchy and component consistency for recruitment workflows','Learning-focused design process grounded in usability and clarity'], tools:'Figma, ChatGPT, NotebookLM', caseStudyUrl:'https://www.behance.net/gallery/224693647/Hirect-Dashboard-UI-UX-Case-Study'},
  hirekit:{cat:'Landing Page', title:'Hirekit Landing Page', desc:'Hirekit was one of the projects I worked on during my UI/UX learning journey. Instead of designing the experience completely from scratch, I chose an existing Hirekit landing page as a learning reference and recreated its design to better understand how professional landing pages are structured and how different UI/UX principles are applied in a real product. The main goal of this project was to learn by analyzing an existing digital experience and understanding the design decisions behind it. I wanted to practice how to build a clear visual hierarchy, organize content into meaningful sections, create effective layouts and spacing, use typography consistently, guide users toward important actions, and maintain visual consistency throughout a landing page. I started by studying the existing Hirekit landing page and breaking it down into its main sections. I analyzed how the content was structured, how elements were positioned, and how the visual hierarchy guided the user’s attention. I then recreated the experience as a UI/UX practice project, focusing on understanding the reasoning behind the interface rather than simply reproducing individual elements. Working on a real existing landing page gave me a practical way to connect the UI/UX concepts I was learning with an actual digital product. This project helped me better understand layout, spacing, typography, visual hierarchy, section structure, and user flow, while also teaching me how to look at an interface from a designer’s perspective and identify why certain design decisions work. Although this project was created as part of my learning journey, it was an important step in developing my design process. Recreating an existing experience helped me move beyond learning design principles theoretically and start applying them through hands-on practice. This project also taught me the value of studying real-world products as a way to improve my design skills and build a stronger understanding of how UI/UX decisions come together to create a cohesive user experience. I used Figma, ChatGPT, and NotebookLM throughout the process.', highlights:['Recreated a real-world recruitment landing page as a learning project','Analyzed hierarchy, spacing, typography, and user flow','Applied structured UI thinking to a realistic product reference'], tools:'Figma, ChatGPT, NotebookLM', caseStudyUrl:''},
  aurelia:{cat:'Branding', title:'Aurelia', desc:'A full brand identity and visual system for an independent jewellery label, spanning logo, packaging and digital presence.', highlights:['Developed logo, type system and packaging guidelines','Built a flexible visual language for social and print','Delivered a complete brand book for future collaborators'], tools:'Illustrator, Figma, Photoshop'},
  pulse:{cat:'Dashboard', title:'Pulse', desc:'An admin dashboard giving operations teams a single, calm view of a busy logistics network, built for fast decisions under pressure.', highlights:['Consolidated five legacy tools into one interface','Prioritised critical alerts with a new visual hierarchy','Usability testing shortened new-hire ramp-up time'], tools:'Figma, React, Storybook'},
  meridian:{cat:'Website', title:'Meridian', desc:"A corporate website redesign built to modernise a 20-year-old architecture firm's presence while honouring its editorial legacy.", highlights:['Editorial layout system for 200+ project pages','Improved mobile performance and load time','Fully WCAG-AA accessible component library'], tools:'Figma, Webflow'}
};

const showcaseProjects = [
  { key:'gparts', image:'assetes/g-parts-pro-app.png', role:'UI/UX Designer', focus:'Navigation & Catalog UX', description:'Conducted competitive audits and designed high-fidelity splash screens, home layouts, and color themes focused on spare part catalog navigation. Engineered simplified search and filter user flows to reduce navigation drop-off.' },
  { key:'vitalife', image:'assetes/vita-life-app.png', role:'UI/UX Designer', focus:'Health Data & Alert UX', description:'Designed an end-to-end mobile app UI connecting seamlessly with smartwatches and smart rings to monitor real-time vital health indicators including heart rate, blood oxygen, sleep tracking, and body temperature.' },
  { key:'alasala', image:'assetes/al-asala-restaurant.png', role:'UI/UX Designer', focus:'RTL Experience Design', description:'Designed an Arabic-first, Right-to-Left (RTL) responsive landing page for a traditional Arabic restaurant, focusing on brand identity, food presentation, and visual hierarchy.' },
  { key:'hirekit', image:'assetes/hirekit-landing-page.png', role:'UI/UX Learner', focus:'Landing Page UX Study', description:'A landing page case study for Hirekit, a recruitment platform designed to connect companies with potential candidates. This is a real existing landing page that I studied and recreated during my UI/UX learning journey.' },
  { key:'hirect', image:'assetes/hirect-dashboard.png', role:'UI/UX Designer', focus:'Dashboard Architecture', description:'Hirect was my first dashboard design project, created as part of my journey in learning and developing my UI/UX design skills. The project focused on designing a recruitment platform dashboard with a clear structure and user-friendly information flow.' }
];

const projectShowcaseImage = document.getElementById('projectShowcaseImage');
const projectShowcaseCategory = document.getElementById('projectShowcaseCategory');
const projectShowcaseTitle = document.getElementById('projectShowcaseTitle');
const projectShowcaseDescription = document.getElementById('projectShowcaseDescription');
const projectShowcaseRole = document.getElementById('projectShowcaseRole');
const projectShowcaseTools = document.getElementById('projectShowcaseTools');
const projectShowcaseFocus = document.getElementById('projectShowcaseFocus');
const projectCounter = document.getElementById('projectCounter');
const projectPrev = document.getElementById('projectPrev');
const projectNext = document.getElementById('projectNext');
const projectViewBtn = document.getElementById('projectViewBtn');
let activeProjectIndex = 0;

function renderProjectShowcase(index){
  const project = showcaseProjects[index];
  const data = projectsData[project.key];
  if(!project || !data) return;

  const showcaseShell = document.querySelector('.project-showcase-shell');
  showcaseShell.classList.remove('is-changing');
  void showcaseShell.offsetWidth;
  showcaseShell.classList.add('is-changing');

  projectShowcaseImage.src = project.image;
  projectShowcaseImage.alt = data.title + ' preview';
  projectShowcaseCategory.textContent = data.cat;
  projectShowcaseTitle.textContent = data.title;
  projectShowcaseDescription.textContent = project.description;
  projectShowcaseRole.textContent = project.role;
  projectShowcaseTools.textContent = data.tools;
  projectShowcaseFocus.textContent = project.focus;
  projectViewBtn.dataset.project = project.key;
  projectCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(showcaseProjects.length).padStart(2, '0')}`;

  window.clearTimeout(renderProjectShowcase.timer);
  renderProjectShowcase.timer = window.setTimeout(() => showcaseShell.classList.remove('is-changing'), 420);
}

function changeProject(direction){
  activeProjectIndex = (activeProjectIndex + direction + showcaseProjects.length) % showcaseProjects.length;
  renderProjectShowcase(activeProjectIndex);
}

projectPrev.addEventListener('click', () => changeProject(-1));
projectNext.addEventListener('click', () => changeProject(1));
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') changeProject(-1);
  if (event.key === 'ArrowRight') changeProject(1);
});
renderProjectShowcase(activeProjectIndex);

const modal = document.getElementById('projectModal');
const modalCat = document.getElementById('modalCat');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalHighlights = document.getElementById('modalHighlights');
const modalTools = document.getElementById('modalTools');
const modalLinks = document.getElementById('modalLinks');
let lastFocused = null;
function openModal(key){
  const d = projectsData[key];
  if(!d) return;
  modalCat.textContent = d.cat;
  modalTitle.textContent = d.title;
  modalDesc.textContent = d.desc;
  modalHighlights.innerHTML = d.highlights.map(h => '<li>' + h + '</li>').join('');
  modalTools.textContent = d.tools;
if(d.caseStudyUrl && (key === 'gparts' || key === 'vitalife')){
  modalLinks.innerHTML = '<a class="modal-link" href="' + d.caseStudyUrl + '" target="_blank" rel="noopener noreferrer">View Case Study <svg class="icon" aria-hidden="true"><use href="#icon-external"/></svg></a>';
} else {
  modalLinks.innerHTML = '';
}
  lastFocused = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  body.classList.add('modal-open');
  document.getElementById('modalClose').focus();
}
function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  body.classList.remove('modal-open');
  if(lastFocused) lastFocused.focus();
}
document.querySelectorAll('.project-cta').forEach(btn => btn.addEventListener('click', () => openModal(btn.getAttribute('data-project'))));
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

/* ---------- Experience carousel ---------- */
const experienceTrack = document.getElementById('experienceTrack');
const experienceSlides = experienceTrack ? Array.from(experienceTrack.children) : [];
const expPrev = document.getElementById('expPrev');
const expNext = document.getElementById('expNext');
let expIndex = 0;
let expTouchStartX = 0;
function goToExperience(index){
  if(!experienceTrack || !experienceSlides.length) return;
  expIndex = (index + experienceSlides.length) % experienceSlides.length;
  experienceTrack.style.transform = 'translateX(-' + (expIndex * 100) + '%)';
}
if(expPrev && expNext && experienceTrack){
  expPrev.addEventListener('click', () => goToExperience(expIndex - 1));
  expNext.addEventListener('click', () => goToExperience(expIndex + 1));
  experienceTrack.addEventListener('touchstart', e => { expTouchStartX = e.touches[0].clientX; }, {passive:true});
  experienceTrack.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - expTouchStartX;
    if(Math.abs(dx) > 40) goToExperience(expIndex + (dx < 0 ? 1 : -1));
  }, {passive:true});
  goToExperience(0);
}

/* ---------- Testimonial carousel ---------- */
const testiTrack = document.getElementById('testiTrack');
const testiSlides = Array.from(testiTrack.children);
const testiDotsWrap = document.getElementById('testiDots');
let testiIndex = 0, testiTimer = null;
testiSlides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', 'Go to testimonial ' + (i+1));
  dot.addEventListener('click', () => goToSlide(i, true));
  testiDotsWrap.appendChild(dot);
});
const testiDots = Array.from(testiDotsWrap.children);
function goToSlide(i, userAction){
  testiIndex = (i + testiSlides.length) % testiSlides.length;
  testiTrack.style.transform = 'translateX(-' + (testiIndex*100) + '%)';
  testiDots.forEach((d, di) => d.classList.toggle('active', di === testiIndex));
  if(userAction) restartAutoplay();
}
function startAutoplay(){ if(reduceMotion) return; stopAutoplay(); testiTimer = setInterval(() => goToSlide(testiIndex+1), 5000); }
function stopAutoplay(){ clearInterval(testiTimer); }
function restartAutoplay(){ stopAutoplay(); startAutoplay(); }
document.getElementById('testiPrev').addEventListener('click', () => goToSlide(testiIndex-1, true));
document.getElementById('testiNext').addEventListener('click', () => goToSlide(testiIndex+1, true));
const testiCarousel = document.getElementById('testiCarousel');
testiCarousel.addEventListener('mouseenter', stopAutoplay);
testiCarousel.addEventListener('mouseleave', startAutoplay);
document.addEventListener('visibilitychange', () => { if(document.hidden) stopAutoplay(); else startAutoplay(); });
let touchStartX = 0;
testiTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAutoplay(); }, {passive:true});
testiTrack.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 40) goToSlide(testiIndex + (dx < 0 ? 1 : -1));
  startAutoplay();
}, {passive:true});
goToSlide(0);
startAutoplay();

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  if(!contactForm.checkValidity()){ contactForm.reportValidity(); return; }
  const formData = new FormData(contactForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const mailSubject = subject || `Portfolio inquiry from ${name}`;
  const mailBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    message
  ].join('\n');
  const mailto = `mailto:mohamed.ahmed.uiux.designer@gmail.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

  window.location.href = mailto;
  formSuccess.textContent = 'Your email app is opening with your message ready to send.';
  formSuccess.classList.add('show');
  contactForm.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 5000);
});

/* ---------- CV download ---------- */
const downloadCv = document.getElementById('downloadCv');
if(downloadCv){
  const cvUrl = downloadCv.getAttribute('href');
  const cvFilename = downloadCv.getAttribute('download') || 'Mohamed Ahmed - CV.pdf';
  downloadCv.addEventListener('click', async (event) => {
    event.preventDefault();
    try{
      const response = await fetch(cvUrl);
      if(!response.ok) throw new Error('CV download failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = objectUrl;
      tempLink.download = cvFilename;
      tempLink.style.display = 'none';
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error(error);
      window.location.href = cvUrl;
    }
  });
}

/* ---------- Placeholder "#" links (CV, certificates, socials) ---------- */
document.querySelectorAll('a[href="#"]').forEach(a => {
  if(!a.hasAttribute('data-scroll')) a.addEventListener('click', e => e.preventDefault());
});

/* ---------- Button ripple ---------- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e){
    if(reduceMotion) return;
    const rect = btn.getBoundingClientRect();
    const clientX = typeof e.clientX === 'number' ? e.clientX : rect.left + rect.width / 2;
    const clientY = typeof e.clientY === 'number' ? e.clientY : rect.top + rect.height / 2;
    const span = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (clientX - rect.left - size/2) + 'px';
    span.style.top = (clientY - rect.top - size/2) + 'px';
    btn.appendChild(span);
    setTimeout(() => span.remove(), 650);
  });
});

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

})();
