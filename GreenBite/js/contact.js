document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('contactMsg');

  // ✅ FAQ accordion logic with animation
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const ans = q.nextElementSibling;
      q.classList.toggle('active');
      ans.classList.toggle('open');
    });
  });

  // ✅ Contact form validation + localStorage save
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      msg.textContent = "⚠️ Please fill in all fields.";
      msg.style.color = "red";
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      msg.textContent = "⚠️ Please enter a valid email address.";
      msg.style.color = "red";
      return;
    }

    // Save feedback in localStorage
    const feedback = {
      name,
      email,
      message,
      date: new Date().toLocaleString()
    };

    let stored = JSON.parse(localStorage.getItem('greenbite_feedbacks')) || [];
    stored.push(feedback);
    localStorage.setItem('greenbite_feedbacks', JSON.stringify(stored));

    // Confirmation message
    msg.textContent = `✅ Thank you, ${name}! Your message has been saved.`;
    msg.style.color = "green";

    form.reset();
  });
});

