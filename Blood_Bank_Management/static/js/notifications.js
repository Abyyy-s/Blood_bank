const API_URL = '';

async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/notifications`);
        if (!response.ok) throw new Error('Failed to load');

        const notes = await response.json();
        const panel = document.getElementById('notificationsPanel');
        panel.innerHTML = '';

        if (!Array.isArray(notes) || notes.length === 0) {
            panel.innerHTML = `
                <div style="text-align:center; color:var(--text-muted); padding:3rem;">
                    <div style="font-size:3rem; margin-bottom:1rem;">🔔</div>
                    <div style="font-size:1.1rem;">No notifications yet</div>
                </div>`;
            return;
        }

        notes.forEach(n => {
            const isUnread = !n.is_read;
            const item = document.createElement('div');
            item.className = 'notification-item';
            Object.assign(item.style, {
                background:   isUnread ? '#fff8f0' : '#ffffff',
                border:       `1px solid ${isUnread ? '#f0c080' : '#e8e8e8'}`,
                borderRadius: '10px',
                padding:      '1rem 1.2rem',
                marginBottom: '0.8rem',
                display:      'flex',
                justifyContent: 'space-between',
                alignItems:   'flex-start',
                gap:          '1rem',
            });

            // Icon based on message content
            let icon = '🔔';
            const msg = n.message.toLowerCase();
            if (msg.includes('fulfilled'))  icon = '✅';
            else if (msg.includes('rejected')) icon = '❌';
            else if (msg.includes('new blood request') || msg.includes('submitted')) icon = '🩸';
            else if (msg.includes('insufficient') || msg.includes('mismatch')) icon = '⚠️';
            else if (msg.includes('cancel')) icon = '🚫';

            item.innerHTML = `
                <div style="display:flex; gap:0.8rem; align-items:flex-start; flex:1;">
                    <span style="font-size:1.4rem; margin-top:0.1rem;">${icon}</span>
                    <div>
                        <p style="margin:0; color:#1a2535; font-size:0.95rem; line-height:1.5;">
                            ${n.message}
                        </p>
                        <span style="font-size:0.8rem; color:#888; margin-top:0.3rem; display:block;">
                            ${new Date(n.created_at).toLocaleString('en-IN', {
                                day:'numeric', month:'short', year:'numeric',
                                hour:'2-digit', minute:'2-digit'
                            })}
                        </span>
                    </div>
                </div>
                ${isUnread
                    ? `<span style="
                        background:#C0392B; color:white;
                        border-radius:50%; width:10px; height:10px;
                        display:inline-block; flex-shrink:0; margin-top:0.4rem;"
                      ></span>`
                    : ''}`;

            // Mark as read on click
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => markRead(n.notification_id, item));

            panel.appendChild(item);
        });

        // Update badge count in sidebar
        updateNotificationBadge(notes.filter(n => !n.is_read).length);

    } catch (error) {
        console.error('Error loading notifications:', error);
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.innerHTML = `
                <div style="text-align:center; color:#C0392B; padding:2rem;">
                    <div style="font-size:2rem;">⚠️</div>
                    <div>Could not load notifications</div>
                </div>`;
        }
    }
}

async function markRead(notificationId, itemEl) {
    try {
        await fetch(`${API_URL}/notifications/${notificationId}/read`, { method: 'POST' });
        // Update visual
        itemEl.style.background = '#ffffff';
        itemEl.style.border     = '1px solid #e8e8e8';
        const dot = itemEl.querySelector('span[style*="border-radius:50%"]');
        if (dot) dot.remove();
    } catch (e) {
        // silently ignore
    }
}

function updateNotificationBadge(count) {
    // Update bell icon badge in sidebar if it exists
    let badge = document.getElementById('notifBadge');
    const bellLink = document.querySelector('a[href="/static/notifications.html"] .sidebar-nav-icon');
    if (!bellLink) return;

    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'notifBadge';
            Object.assign(badge.style, {
                background:   '#C0392B',
                color:        'white',
                borderRadius: '50%',
                fontSize:     '0.7rem',
                width:        '18px',
                height:       '18px',
                display:      'inline-flex',
                alignItems:   'center',
                justifyContent: 'center',
                marginLeft:   '4px',
            });
            bellLink.appendChild(badge);
        }
        badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) {
        badge.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadNotifications();
    setInterval(loadNotifications, 30000);
});