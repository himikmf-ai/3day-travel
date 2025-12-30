fetch('./trip-data.json')
  .then(r => r.json())
  .then(tripData => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.ready();
    
    const tabs = document.querySelectorAll('.tab');
    const dayContent = document.getElementById('day-content');
    const saveBtn = document.getElementById('save-trip');
    
    let currentDay = 1;
    
    function renderDay(dayNumber) {
      const day = tripData.days.find(d => d.day_number === dayNumber);
      if (!day) return;
      
      currentDay = dayNumber;
      
      dayContent.innerHTML = `
        <h2>День ${day.day_number}: ${day.title}</h2>
        ${day.description ? `<p style="color: #cbd5e1; font-size: 13px; margin-bottom: 16px;">${day.description}</p>` : ''}
        <div class="items">
          ${day.items.map((item, idx) => `
            <article class="item-card" style="animation-delay: ${idx * 0.05}s">
              ${item.photo_url ? `<img src="${item.photo_url}" alt="${item.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">` : ''}
              <h3>${item.title}</h3>
              <p>${item.description_short}</p>
              <p class="meta">⏱️ ${item.recommended_time} • ~${item.approx_duration_hours}ч</p>
              ${item.tags ? `<p class="tags">${item.tags.map(t => `#${t}`).join(' ')}</p>` : ''}
            </article>
          `).join('')}
        </div>
      `;
    }
    
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
        selected_day: currentDay
      };
      tg.sendData(JSON.stringify(data));
      tg.close();
    });
    
    renderDay(1);
  })
  .catch(err => {
    console.error('Failed to load:', err);
    document.getElementById('day-content').innerHTML = '<p>Ошибка загрузки</p>';
  });
