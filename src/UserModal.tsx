import React from 'react';
import './index.css';

const UserModal: React.FC<{ user: any; onClose: () => void }> = ({
  user,
  onClose,
}) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="user-header">
          <div className="user-avatar-large">{user.name.charAt(0)}</div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>

        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">职位:</span>
            <span>{user.role}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">部门:</span>
            <span>{user.department}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">状态:</span>
            <span className="status-active">在线</span>
          </div>
        </div>

        <div className="user-actions">
          <button className="action-button">发送消息</button>
          <button className="action-button">查看资料</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
