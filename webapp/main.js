fetch('./trip-data.json')
  .then(r => r.json())
  .then(tripData => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    const tabs = document.querySelectorAll('.tab');
    const dayContent = document.getElementById('day-content');
    const saveBtn = document.getElementById('save-trip');
    
    function renderDay(dayNumber) {
      const day = tripData.days.find(d => d.day_number === dayNumber);
      if (!day) return;
      
      dayContent.innerHTML = `
        <h2>День ${day.day_number}: ${day.title}</h2>
        <div class="items">
          ${day.items.map(item => `
            <article class="item-card">
              <h3>${item.title}</h3>
              <p>${item.description_short}</p>
              <p class="meta">Время: ${item.recommended_time}, ~${item.approx_duration_hours} ч.</p>
              ${item.tags ? `<p class="tags">${item.tags.map(t => `#${t}`).join(' ')}</p>` : ''}
            </article>
          `).join('')}
        </div>
      `;
    }
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const dayNumber = Number(tab.dataset.day);
        renderDay(dayNumber);
      });
    });
    
    saveBtn.addEventListener('click', () => {
      const data = { trip_id: tripData.trip_id, action: 'save_trip' };
      tg.sendData(JSON.stringify(data));
      tg.close();
    });
    
    renderDay(1);
  });
