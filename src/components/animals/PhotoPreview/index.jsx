import { useState } from 'react';
import styles from './PhotoPreview.module.css';

const PhotoPreview = ({ files, onRemove, onSetPrimary, primaryFileId, disabled = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>プレビュー ({files.length}枚)</h4>
        <p>クリックで拡大表示、メイン写真を設定できます</p>
      </div>

      <div className={styles.grid}>
        {files.map((fileData, index) => (
          <div 
            key={fileData.id} 
            className={`${styles.item} ${primaryFileId === fileData.id ? styles.primary : ''}`}
          >
            <div 
              className={styles.imageContainer}
              onClick={() => handleImageClick(fileData)}
            >
              <img
                src={fileData.previewUrl}
                alt={fileData.name}
                className={styles.image}
              />
              <div className={styles.overlay}>
                <span className={styles.zoomIcon}>🔍</span>
              </div>
              {primaryFileId === fileData.id && (
                <div className={styles.primaryBadge}>
                  ⭐ メイン
                </div>
              )}
              {index === 0 && !primaryFileId && (
                <div className={styles.firstBadge}>
                  1枚目
                </div>
              )}
            </div>

            <div className={styles.info}>
              <div className={styles.fileName}>{fileData.name}</div>
              <div className={styles.fileSize}>{formatFileSize(fileData.size)}</div>
            </div>

            {!disabled && (
              <div className={styles.actions}>
                <button
                  onClick={() => onSetPrimary?.(fileData.id)}
                  className={`${styles.actionButton} ${styles.primaryButton}`}
                  disabled={primaryFileId === fileData.id}
                  title="メイン写真に設定"
                >
                  ⭐
                </button>
                <button
                  onClick={() => onRemove?.(fileData.id)}
                  className={`${styles.actionButton} ${styles.removeButton}`}
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* モーダル表示 */}
      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            <img
              src={selectedImage.previewUrl}
              alt={selectedImage.name}
              className={styles.modalImage}
            />
            <div className={styles.modalInfo}>
              <h3>{selectedImage.name}</h3>
              <div className={styles.modalDetails}>
                <span>サイズ: {formatFileSize(selectedImage.size)}</span>
                <span>形式: {selectedImage.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreview;