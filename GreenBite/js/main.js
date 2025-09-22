// Reusable helper
function createEl(tag, attrs={}, text=''){
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k.startsWith('data-')) el.setAttribute(k, attrs[k]);
    else el[k] = attrs[k];
  }
  if (text) el.textContent = text;
  return el;
}

/* NAV toggle */
document.addEventListener('DOMContentLoaded', () => {
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  ham?.addEventListener('click', () => {
    const expanded = ham.getAttribute('aria-expanded') === 'true';
    ham.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
  });

  // slogans auto-rotate
  const slogans = [
    "Eat real food, not too much.",
    "Move your body every day.",
    "Sleep well, manage stress.",
    "Balance is the secret ingredient."
  ];
  let sIndex = 0;
  const sloganEl = document.getElementById('slogan');
  function rotateSlogan(){
    sIndex = (sIndex + 1) % slogans.length;
    if (sloganEl) sloganEl.textContent = slogans[sIndex];
  }
  setInterval(rotateSlogan, 4000);

  // tip of the day - date based
  const tips = [
    "Add one extra vegetable to today's lunch.",
    "Drink a glass of water before each meal.",
    "Take a 10-minute walk after lunch today.",
    "Try a 5-minute mindful breathing break mid-afternoon.",
    "Swap soda for sparkling water with lemon."
  ];
  const tipEl = document.getElementById('tipOfDay');
  if (tipEl){
    const now = new Date();
    // day of year
    const start = new Date(now.getFullYear(),0,0);
    const diff = now - start;
    const oneDay = 1000*60*60*24;
    const dayOfYear = Math.floor(diff/oneDay);
    const tip = tips[dayOfYear % tips.length];
    tipEl.textContent = tip;
  }

  // featured recipes (first 3)
  const featuredEl = document.getElementById('featuredRecipes');
  if (featuredEl && typeof RECIPES !== 'undefined') {
    RECIPES.slice(0,3).forEach(r => {
      const card = createEl('div', {className:'card'});
      const img = createEl('img'); img.src = r.img; img.alt = r.title;
      const title = createEl('div', {className:'card-title'}, r.title);
      card.appendChild(img); card.appendChild(title);
      featuredEl.appendChild(card);
    });
  }

  // newsletter
  const form = document.getElementById('newsletterForm');
  const emailIn = document.getElementById('newsletterEmail');
  const msg = document.getElementById('newsletterMsg');
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = emailIn.value.trim();
    if (!email || !email.includes('@')) {
      msg.textContent = 'Please enter a valid email.';
      return;
    }
    localStorage.setItem('greenbite_newsletterEmail', email);
    msg.textContent = 'Thanks — you are subscribed!';
    emailIn.value = '';
  });

}); // ✅ closes DOMContentLoaded
