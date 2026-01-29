const API_BASE = '/api';

// Ungeschützt: keine Session nötig
export async function fetchDiscordRoles() {
  const response = await fetch(`${API_BASE}/discord-roles`);
  if (!response.ok) throw new Error('Fehler beim Laden der Rollen');
  return await response.json();
}

// Geschützt: Session wird mitgesendet
export async function fetchPanels() {
  const res = await fetch(`${API_BASE}/panels`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Fehler beim Laden der Panels');
  return await res.json();
}

export async function createPanel(panelData) {
  const res = await fetch(`${API_BASE}/panels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(panelData),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Fehler beim Erstellen des Panels');
  return await res.json();
}

export async function updatePanel(id, panelData) {
  const res = await fetch(`${API_BASE}/panels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(panelData),
    credentials: 'include', // 🔐 Session-Cookie wird mitgesendet
  });
  if (!res.ok) throw new Error('Fehler beim Aktualisieren des Panels');
  return await res.json();
}

export async function deletePanel(id) {
  const res = await fetch(`${API_BASE}/panels/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Fehler beim Löschen des Panels');
}

export const getRoles = fetchDiscordRoles;
export const getPanels = fetchPanels;
