import React, { useState } from 'react';
import styles from './AnimalGallery.module.css';

const AnimalGallery = ({ photos }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className={styles.noPhotos}>
        <div className={styles.noPhotosIcon}>📷</div>
        <p>写真がありません</p>
      </div>
    );
  }

  const openModal = (index) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextPhoto = () => {
    setSelectedIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  };

  return (
    <div className={styles.gallery}>
      {/* メイン画像 */}
      <div className={styles.mainImage}>
        <img
          src={photos[selectedIndex]?.url || '/images/default-animal.jpg'}
          alt={`写真 ${selectedIndex + 1}`}
          className={styles.mainImg}
          onClick={() => openModal(selectedIndex)}
          onError={(e) => {
            e.target.src = '/images/default-animal.jpg';
          }}
        />
        {photos.length > 1 && (
          <div className={styles.mainImageControls}>
            <button
              className={styles.navButton}
              onClick={prevPhoto}
              disabled={photos.length <= 1}
            >
              ‹
            </button>
            <span className={styles.imageCounter}>
              {selectedIndex + 1} / {photos.length}
            </span>
            <button
              className={styles.navButton}
              onClick={nextPhoto}
              disabled={photos.length <= 1}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* サムネイル */}
      {photos.length > 1 && (
        <div className={styles.thumbnails}>
          {photos.map((photo, index) => (
            <button
              key={photo.id || index}
              className={`${styles.thumbnail} ${
                index === selectedIndex ? styles.active : ''
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={photo.url}
                alt={`サムネイル ${index + 1}`}
                onError={(e) => {
                  e.target.src = '/images/default-animal.jpg';
                }}
              />
              {photo.is_primary && (
                <div className={styles.primaryBadge}>メイン</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* モーダル */}
      {isModalOpen && (
        <div
          className={styles.modal}
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
            
            <img
              src={photos[selectedIndex]?.url}
              alt={`拡大表示 ${selectedIndex + 1}`}
              className={styles.modalImg}
              onError={(e) => {
                e.target.src = '/images/default-animal.jpg';
              }}
            />
            
            {photos.length > 1 && (
              <>
                <button
                  className={`${styles.modalNavButton} ${styles.prev}`}
                  onClick={prevPhoto}
                >
                  ‹
                </button>
                <button
                  className={`${styles.modalNavButton} ${styles.next}`}
                  onClick={nextPhoto}
                >
                  ›
                </button>
              </>
            )}
            
            <div className={styles.modalCounter}>
              {selectedIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalGallery;