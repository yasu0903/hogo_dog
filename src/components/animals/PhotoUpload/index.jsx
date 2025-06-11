import { useState, useRef } from 'react';
import { api } from '../../../services/api';
import PhotoPreview from '../PhotoPreview';
import PhotoSorter from '../PhotoSorter';
import styles from './PhotoUpload.module.css';

const PhotoUpload = ({ animalId, onUploadComplete, existingPhotos = [] }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [primaryFileId, setPrimaryFileId] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'sort'
  const fileInputRef = useRef(null);

  // ファイル形式とサイズの検証
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return '対応していないファイル形式です。JPEG、PNG、GIF、WebPのみアップロード可能です。';
    }

    if (file.size > maxSize) {
      return 'ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。';
    }

    return null;
  };

  // ファイル選択処理
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  // ドラッグ&ドロップ処理
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 要素の境界から本当に離れた場合のみ状態を変更
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    // 画像ファイルのみをフィルタリング
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      setError('画像ファイル以外が含まれています。画像ファイルのみアップロードできます。');
    }

    if (imageFiles.length > 0) {
      addFiles(imageFiles);
    }
  };

  // ファイル追加処理
  const addFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        // ファイルにプレビュー用のオブジェクトURLを追加
        validFiles.push({
          file,
          id: `new-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: URL.createObjectURL(file),
          isNew: true
        });
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    } else {
      setError(null);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // ファイル削除
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // オブジェクトURLを解放
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.previewUrl) {
        URL.revokeObjectURL(removedFile.previewUrl);
      }
      return updated;
    });

    // プライマリファイルが削除された場合はリセット
    if (primaryFileId === fileId) {
      setPrimaryFileId(null);
    }
  };

  // プライマリファイル設定
  const handleSetPrimary = (fileId) => {
    setPrimaryFileId(fileId);
  };

  // ファイル順序変更
  const handleReorder = (reorderedFiles) => {
    setSelectedFiles(reorderedFiles);
  };

  // 単一ファイルのアップロード
  const uploadSinglePhoto = async (fileData, isFirst) => {
    const { file, id } = fileData;

    try {
      // 1. Presigned URL取得
      setUploadProgress(prev => ({ ...prev, [id]: 10 }));
      
      const uploadUrlResponse = await api.post(
        `/animals/${animalId}/photos/upload-url`,
        { file_name: file.name }
      );

      setUploadProgress(prev => ({ ...prev, [id]: 30 }));

      // 2. S3に直接アップロード
      const uploadResponse = await fetch(uploadUrlResponse.data.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('S3アップロードに失敗しました');
      }

      setUploadProgress(prev => ({ ...prev, [id]: 70 }));

      // 3. 写真メタデータ登録
      const photoData = await api.post(`/animals/${animalId}/photos`, {
        animal_id: animalId,
        s3_key: uploadUrlResponse.data.s3_key,
        file_name: file.name,
        content_type: file.type,
        file_size: file.size,
        is_primary: primaryFileId === id || (isFirst && existingPhotos.length === 0 && !primaryFileId), // プライマリ設定または条件に基づく
        order: existingPhotos.length + selectedFiles.indexOf(fileData)
      });

      setUploadProgress(prev => ({ ...prev, [id]: 100 }));
      return photoData.data;

    } catch (error) {
      console.error(`Photo upload failed for ${file.name}:`, error);
      setUploadProgress(prev => ({ ...prev, [id]: -1 }));
      throw error;
    }
  };

  // 全ファイルアップロード
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    const results = [];
    const errors = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        const result = await uploadSinglePhoto(selectedFiles[i], i === 0);
        results.push(result);
      } catch (error) {
        errors.push(`${selectedFiles[i].name}: アップロードに失敗しました`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    // 成功した分は親コンポーネントに通知
    if (results.length > 0) {
      onUploadComplete?.(results);
    }

    // アップロード完了後にファイル一覧をクリア
    selectedFiles.forEach(fileData => {
      if (fileData.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    });
    setSelectedFiles([]);
    setUploadProgress({});
    setPrimaryFileId(null);
    setUploading(false);

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ファイルサイズを読みやすい形式に変換
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>写真をアップロード</h3>
        <p>JPEG、PNG、GIF、WebP形式のファイルをアップロードできます（最大10MB）</p>
      </div>

      {/* ファイル選択エリア */}
      <div 
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className={styles.uploadLabel}>
          <div className={styles.uploadIcon}>
            {isDragOver ? '📂' : '📷'}
          </div>
          <div className={styles.uploadText}>
            <strong>
              {isDragOver ? 'ファイルをドロップ' : 'ファイルを選択またはドラッグ&ドロップ'}
            </strong>
            <span>
              {isDragOver 
                ? 'ここにファイルを離してください' 
                : '複数のファイルを同時に選択できます'
              }
            </span>
          </div>
        </label>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.error}>
          {error.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {/* 選択されたファイル一覧とプレビュー */}
      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          {/* 表示モード切り替え */}
          {selectedFiles.length > 1 && (
            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode('preview')}
                className={`${styles.toggleButton} ${viewMode === 'preview' ? styles.active : ''}`}
              >
                📷 プレビュー
              </button>
              <button
                onClick={() => setViewMode('sort')}
                className={`${styles.toggleButton} ${viewMode === 'sort' ? styles.active : ''}`}
              >
                🔄 並び替え
              </button>
            </div>
          )}

          {/* 表示コンポーネント */}
          {viewMode === 'preview' ? (
            <PhotoPreview
              files={selectedFiles}
              onRemove={removeFile}
              onSetPrimary={handleSetPrimary}
              primaryFileId={primaryFileId}
              disabled={uploading}
            />
          ) : (
            <PhotoSorter
              files={selectedFiles}
              onReorder={handleReorder}
              onSetPrimary={handleSetPrimary}
              primaryFileId={primaryFileId}
              disabled={uploading}
            />
          )}

          {/* 進捗表示 */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className={styles.progressList}>
              <h4>アップロード進捗</h4>
              {selectedFiles.map((fileData) => (
                uploadProgress[fileData.id] !== undefined && (
                  <div key={fileData.id} className={styles.progressItem}>
                    <span className={styles.progressFileName}>{fileData.name}</span>
                    {uploadProgress[fileData.id] === -1 ? (
                      <div className={styles.progressError}>アップロード失敗</div>
                    ) : uploadProgress[fileData.id] === 100 ? (
                      <div className={styles.progressSuccess}>✓ 完了</div>
                    ) : (
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${uploadProgress[fileData.id]}%` }}
                        />
                        <span className={styles.progressText}>
                          {uploadProgress[fileData.id]}%
                        </span>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          )}

          {/* アップロードボタン */}
          <div className={styles.actions}>
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className={styles.uploadButton}
            >
              {uploading ? 'アップロード中...' : `${selectedFiles.length}枚をアップロード`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;