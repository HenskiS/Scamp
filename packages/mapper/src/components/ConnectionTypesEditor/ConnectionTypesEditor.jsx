import { useState } from 'react';
import styles from './ConnectionTypesEditor.module.css';

export default function ConnectionTypesEditor({
  connectionTypes = [],
  onAddConnectionType,
  onUpdateConnectionType,
  onDeleteConnectionType,
  isTypeInUse
}) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('#888888');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#888888');

  const handleStartEdit = (connectionType) => {
    setEditingId(connectionType.id);
    setEditingName(connectionType.name);
    setEditingColor(connectionType.color);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      alert('Connection type name cannot be empty');
      return;
    }

    onUpdateConnectionType(editingId, {
      name: editingName.trim(),
      color: editingColor
    });

    setEditingId(null);
    setEditingName('');
    setEditingColor('#888888');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#888888');
  };

  const handleDelete = (connectionType) => {
    if (isTypeInUse(connectionType.id)) {
      alert(`Cannot delete "${connectionType.name}" because it is currently in use by connections or ports.`);
      return;
    }

    if (confirm(`Are you sure you want to delete "${connectionType.name}"?`)) {
      onDeleteConnectionType(connectionType.id);
    }
  };

  const handleStartAddNew = () => {
    setIsAddingNew(true);
    setNewName('');
    setNewColor('#888888');
  };

  const handleSaveNew = () => {
    if (!newName.trim()) {
      alert('Connection type name cannot be empty');
      return;
    }

    onAddConnectionType({
      name: newName.trim(),
      color: newColor
    });

    setIsAddingNew(false);
    setNewName('');
    setNewColor('#888888');
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewName('');
    setNewColor('#888888');
  };

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h3 className={styles.title}>Connection Types</h3>
        {!isAddingNew && (
          <button className={styles.addButton} onClick={handleStartAddNew} title="Add new connection type">
            + Add
          </button>
        )}
      </div>

      <div className={styles.content}>
        {isAddingNew && (
          <div className={styles.editForm}>
            <div className={styles.formRow}>
              <label className={styles.label}>Name:</label>
              <input
                type="text"
                className={styles.input}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., MIDI, Audio, S/PDIF"
                autoFocus
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.label}>Color:</label>
              <div className={styles.colorInputGroup}>
                <input
                  type="color"
                  className={styles.colorPicker}
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                />
                <input
                  type="text"
                  className={styles.colorInput}
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="#888888"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveButton} onClick={handleSaveNew}>
                Save
              </button>
              <button className={styles.cancelButton} onClick={handleCancelNew}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className={styles.list}>
          {connectionTypes.length === 0 ? (
            <div className={styles.emptyState}>No connection types defined</div>
          ) : (
            connectionTypes.map(ct => (
              <div key={ct.id} className={styles.listItem}>
                {editingId === ct.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.formRow}>
                      <label className={styles.label}>Name:</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.label}>Color:</label>
                      <div className={styles.colorInputGroup}>
                        <input
                          type="color"
                          className={styles.colorPicker}
                          value={editingColor}
                          onChange={(e) => setEditingColor(e.target.value)}
                        />
                        <input
                          type="text"
                          className={styles.colorInput}
                          value={editingColor}
                          onChange={(e) => setEditingColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={styles.formActions}>
                      <button className={styles.saveButton} onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button className={styles.cancelButton} onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.itemContent}>
                    <div className={styles.itemHeader}>
                      <div
                        className={styles.colorSwatch}
                        style={{ backgroundColor: ct.color }}
                        title={ct.color}
                      />
                      <span className={styles.itemName}>{ct.name}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleStartEdit(ct)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDelete(ct)}
                        title={isTypeInUse(ct.id) ? 'Cannot delete (in use)' : 'Delete'}
                        disabled={isTypeInUse(ct.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
