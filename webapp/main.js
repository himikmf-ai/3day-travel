fetch('./trip-data.json')
  .then(r => r.json())
  .then(tripData => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
    
    const tabs = document.querySelectorAll('.tab');
    const dayContent = document.getElementById('day-content');
    const saveBtn = document.getElementById('save-trip');
    const prefBtns = document.querySelectorAll('.pref-btn');
    const resetBtn = document.getElementById('reset-filters');
    
    let currentDay = 1;
    let activeFilters = {
      nature: null,
      activity: null,
      transport: null
    };
    
    function matchesFilters(item) {
      if (activeFilters.nature && !item.preferences?.nature?.includes(activeFilters.nature)) return false;
      if (activeFilters.activity && !item.preferences?.activity?.includes(activeFilters.activity)) return false;
      if (activeFilters.transport && !item.preferences?.transport?.includes(activeFilters.transport)) return false;
      return true;
    }
    
    function renderDay(dayNumber) {
      const day = tripData.days.find(d => d.day_number === dayNumber);
      if (!day) return;
      
      currentDay = dayNumber;
      
      const filteredItems = day.items.filter(matchesFilters);
      
      dayContent.innerHTML = `
        <h2>День ${day.day_number}: ${day.title}</h2>
        ${day.description ? `<p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">${day.description}</p>` : ''}
        <div class="items">
        ${filteredItems.length > 0 ? filteredItems.map((item, idx) => `
          <article class="item-card" style="animation-delay: ${idx * 0.05}s">
          ${item.photo_url ? `<img src="${item.photo_url}" alt="${item.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">` : ''}
          <h3>${item.title}</h3>
          <p>${item.description_short}</p>
          <p class="meta">⏱️ ${item.recommended_time} • ~${item.approx_duration_hours}ч</p>
          ${item.tags ? `<p class="tags">${item.tags.map(t => `#${t}`).join(' ')}</p>` : ''}
          </article>
        `).join('') : '<p style="text-align: center; color: #999; padding: 20px;">К сожалению, нет локаций, соответствующих вашим фильтрам</p>'}
        </div>
      `;
    }
    
    prefBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const pref = btn.dataset.pref;
        
        document.querySelectorAll(`.pref-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
        
        if (activeFilters[type] === pref) {
          activeFilters[type] = null;
        } else {
          activeFilters[type] = pref;
          btn.classList.add('active');
        }
        
        renderDay(currentDay);
      });
    });
    
    resetBtn.addEventListener('click', () => {
      activeFilters = { nature: null, activity: null, transport: null };
      prefBtns.forEach(btn => btn.classList.remove('active'));
      renderDay(currentDay);
    });
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const dayNumber = Number(tab.dataset.day);
        if (currentDay === dayNumber) return;
        
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderDay(dayNumber);
      });
    });
    
    saveBtn.addEventListener('click', () => {
      const data = { 
        trip_id: tripData.trip_id, 
        action: 'save_trip',
        selected_day: currentDay,
        preferences: activeFilters
      };
      tg.sendData(JSON.stringify(data));
      tg.close();
    });
    
    renderDay(1);
  })
  .catch(err => {
    console.error('Failed to load:', err);
    document.getElementById('day-content').innerHTML = '<p>Ошибка загрузки</p>';
  })
