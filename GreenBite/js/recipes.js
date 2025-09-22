document.addEventListener('DOMContentLoaded', ()=> {
  const grid = document.getElementById('recipesGrid');
  const filter = document.getElementById('filterCategory');
  const search = document.getElementById('searchName');
  const clear = document.getElementById('clearFilters');
  const modal = document.getElementById('recipeModal');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');

  if (!grid || typeof RECIPES === 'undefined') return;

  // populate categories
  const cats = Array.from(new Set(RECIPES.map(r=>r.category)));
  cats.forEach(c => {
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c;
    filter.appendChild(opt);
  });

  function render(recipes){
    grid.innerHTML = '';
    recipes.forEach(r=> {
      const card = document.createElement('div'); card.className='card';
      const img = document.createElement('img'); img.src = r.img; img.alt = r.title;
      const title = document.createElement('h3'); title.textContent = r.title;
      const p = document.createElement('p'); p.textContent = r.short;
      const btn = document.createElement('button'); btn.textContent = 'Open'; btn.addEventListener('click', ()=> openModal(r));
      card.append(img,title,p,btn);
      grid.appendChild(card);
    });
  }

  function openModal(recipe){
    modalBody.innerHTML = '';
    const h = document.createElement('h2'); h.textContent = recipe.title;
    const img = document.createElement('img'); img.src = recipe.img; img.style.width='100%';
    const ingTitle = document.createElement('h3'); ingTitle.textContent='Ingredients';
    const ul = document.createElement('ul');
    recipe.ingredients.forEach(i => { const li=document.createElement('li'); li.textContent=i; ul.appendChild(li); });
    const stepsTitle = document.createElement('h3'); stepsTitle.textContent='Steps';
    const ol = document.createElement('ol');
    recipe.steps.forEach(s => { const li=document.createElement('li'); li.textContent=s; ol.appendChild(li); });

    const nutTitle = document.createElement('h3'); nutTitle.textContent='Nutrition';
    const table = document.createElement('table');
    table.innerHTML = `<thead><tr><th>Calories</th><th>Carbs (g)</th><th>Protein (g)</th><th>Fat (g)</th></tr></thead>
      <tbody><tr><td>${recipe.nutrition.calories}</td><td>${recipe.nutrition.carbs}</td><td>${recipe.nutrition.protein}</td><td>${recipe.nutrition.fat}</td></tr></tbody>`;

    modalBody.append(h,img,ingTitle,ul,stepsTitle,ol,nutTitle,table);
    modal.style.display='block';
    modal.setAttribute('aria-hidden','false');
  }

  closeModal.addEventListener('click', ()=> {
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
  });

  filter.addEventListener('change', ()=> applyFilters());
  search.addEventListener('input', ()=> applyFilters());
  clear.addEventListener('click', ()=> { filter.value=''; search.value=''; applyFilters(); });

  function applyFilters(){
    const cat = filter.value.trim();
    const q = search.value.trim().toLowerCase();
    const out = RECIPES.filter(r=>{
      return (cat === '' || r.category === cat) && (q === '' || r.title.toLowerCase().includes(q));
    });
    render(out);
  }

  // initial
  render(RECIPES);
});
