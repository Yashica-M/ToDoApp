import React from 'react';

const EditTaskModal = ({
  isOpen,
  onClose,
  onSave,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editDueDate,
  setEditDueDate,
  editPriority,
  setEditPriority,
  handleSaveEdit,
  handleCancelEdit
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.18)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="modal-content" style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(33,150,243,0.18)',
        padding: '32px 28px 24px 28px',
        minWidth: '340px',
        maxWidth: '480px',
        width: '100%',
        position: 'relative'
      }}>
        <h2 style={{marginBottom: '18px'}}>Edit Task</h2>
        <form className="edit-task-form" onSubmit={handleSaveEdit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Title"
            required
            style={{
              fontSize: '17px',
              padding: '10px 14px',
              borderRadius: '7px',
              border: '1px solid #bdbdbd',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(33,150,243,0.04)',
              marginBottom: '2px'
            }}
          />
          <textarea
            value={editDescription}
            onChange={e => setEditDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            style={{
              fontSize: '16px',
              padding: '10px 14px',
              borderRadius: '7px',
              border: '1px solid #bdbdbd',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(33,150,243,0.04)',
              marginBottom: '2px',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <input
              type="date"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              style={{
                fontSize: '15px',
                padding: '8px 10px',
                borderRadius: '7px',
                border: '1px solid #bdbdbd',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(33,150,243,0.04)',
                flex: '1'
              }}
            />
            <select
              value={editPriority}
              onChange={e => setEditPriority(e.target.value)}
              style={{
                fontSize: '15px',
                padding: '8px 10px',
                borderRadius: '7px',
                border: '1px solid #bdbdbd',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(33,150,243,0.04)',
                flex: '1'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="edit-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="action-button save-button soft-badge" style={{
              padding: '0.5em 1.5em',
              borderRadius: '999px',
              background: 'rgba(67,160,71,0.12)',
              color: '#388e3c',
              border: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: '80px',
              textAlign: 'center'
            }}>Save</button>
            <button type="button" className="action-button cancel-button soft-badge" onClick={handleCancelEdit} style={{
              padding: '0.5em 1.5em',
              borderRadius: '999px',
              background: 'rgba(97,97,97,0.12)',
              color: '#616161',
              border: 'none',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: '80px',
              textAlign: 'center'
            }}>Cancel</button>
          </div>
        </form>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '18px',
          right: '18px',
          background: 'none',
          border: 'none',
          fontSize: '22px',
          color: '#888',
          cursor: 'pointer'
        }} aria-label="Close">×</button>
      </div>
    </div>
  );
};

export default EditTaskModal;
