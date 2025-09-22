document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  const results = document.getElementById("results");

  // Counter animation function
  function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    const range = end - start;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      obj.textContent = Math.floor(start + range * progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const age = +document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const height = +document.getElementById("height").value;
    const weight = +document.getElementById("weight").value;
    const activity = +document.getElementById("activity").value;

    // ✅ Calculate BMR
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // ✅ Calculate TDEE
    const tdee = Math.round(bmr * activity);

    // ✅ Macronutrients
    const carbs = Math.round((tdee * 0.5) / 4);
    const protein = Math.round((tdee * 0.2) / 4);
    const fat = Math.round((tdee * 0.3) / 9);

    // ✅ Animate numbers (duration = 1000ms)
    animateValue("bmr", 0, Math.round(bmr), 1000);
    animateValue("tdee", 0, tdee, 1000);
    animateValue("carbs", 0, carbs, 1000);
    animateValue("protein", 0, protein, 1000);
    animateValue("fat", 0, fat, 1000);

    // ✅ Progress bars
    document.getElementById("carbsBar").style.width = "50%";
    document.getElementById("proteinBar").style.width = "20%";
    document.getElementById("fatBar").style.width = "30%";

    results.style.display = "block";
  });
});
