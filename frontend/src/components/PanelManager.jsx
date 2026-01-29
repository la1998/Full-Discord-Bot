import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { createPanel, getRoles, getPanels, deletePanel, updatePanel } from "../services/api";

export default function PanelManager() {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [panels, setPanels] = useState([]);
  const [error, setError] = useState(null);
  const [editingPanelId, setEditingPanelId] = useState(null);

  useEffect(() => {
    getRoles().then((data) => {
      if (Array.isArray(data.roles)) {
        setAvailableRoles(data.roles);
      } else {
        console.warn('⚠️ Ungültiges Rollenformat:', data);
      }
    });
    getPanels().then(setPanels);
  }, []);

  const handleSubmit = async () => {
    const payload = {
      name: title,
      description: description,
      roles: selectedRoles.map(role => ({
        roleId: role.value,
        label: role.label
      }))
    };

    try {
      if (editingPanelId) {
        await updatePanel(editingPanelId, payload);
      } else {
        await createPanel(payload);
      }

      setTitle('');
      setDescription('');
      setSelectedRoles([]);
      setEditingPanelId(null);
      const updated = await getPanels();
      setPanels(updated);
    } catch (err) {
      setError('Fehler beim Speichern des Panels');
      console.error(err);
    }
  };

  const handleEdit = (panel) => {
    setEditingPanelId(panel.id);
    setTitle(panel.name);
    setDescription(panel.description || '');
    setSelectedRoles(
      panel.roles.map(role => ({ value: role.roleId, label: role.label }))
    );
  };

  const handleDelete = async (panelId) => {
    try {
      await deletePanel(panelId);
      const updated = await getPanels();
      setPanels(updated);
    } catch (err) {
      setError('Fehler beim Löschen des Panels');
      console.error(err);
    }
  };

  const roleOptions = availableRoles.map(role => ({
    value: role.id,
    label: role.name
  }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'var(--card)',
      color: 'var(--text)',
      borderColor: '#888',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--card)',
      color: 'var(--text)',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? 'rgba(255,255,255,0.1)'
        : 'var(--card)',
      color: 'var(--text)',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--accent)',
      color: '#fff',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#fff',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text)',
    }),
   input: (base, state) => ({
  ...base,
  color: 'var(--text)',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  outline: 'none',
  border: 'none',
}),
  };

  return (
    <div>
      <h2>{editingPanelId ? '✏️ Panel bearbeiten' : '🛠️ Panel erstellen'}</h2>

      <input
        type="text"
        placeholder="Panel-Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: 'block', marginBottom: '1em', width: '100%' }}
      />

      <textarea
        placeholder="Beschreibung (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: 'block', marginBottom: '1em', width: '100%' }}
        rows={3}
      />

      <label style={{ display: 'block', marginBottom: '0.5em' }}>
        Rollen auswählen:
      </label>
      <Select
        isMulti
        options={roleOptions}
        value={selectedRoles}
        onChange={setSelectedRoles}
        placeholder="Wähle eine oder mehrere Rollen..."
        styles={customSelectStyles}
      />

      <button onClick={handleSubmit} style={{ marginTop: '1em' }}>
        {editingPanelId ? '💾 Panel aktualisieren' : '✅ Panel erstellen'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3 style={{ marginTop: '2em' }}>📋 Vorhandene Panels</h3>
      <ul>
        {panels.map((panel) => (
          <li key={panel.id}>
            <strong>{panel.name}</strong>
            {panel.description && <> – {panel.description}</>}
            <button onClick={() => handleEdit(panel)} style={{ marginLeft: '1em' }}>✏️ Bearbeiten</button>
            <button onClick={() => handleDelete(panel.id)} style={{ marginLeft: '0.5em', color: 'red' }}>🗑️ Löschen</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
