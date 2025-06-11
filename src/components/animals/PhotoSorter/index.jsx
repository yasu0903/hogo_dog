import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styles from './PhotoSorter.module.css';

const PhotoSorter = ({ files, onReorder, onSetPrimary, primaryFileId, disabled = false }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ドラッグ終了時の処理
  const handleDragEnd = (result) => {
    if (!result.destination || disabled) {
      return;
    }

    const { source, destination } = result;

    if (source.index === destination.index) {
      return;
    }

    const reorderedFiles = Array.from(files);
    const [removed] = reorderedFiles.splice(source.index, 1);
    reorderedFiles.splice(destination.index, 0, removed);

    onReorder?.(reorderedFiles);
  };

  // 矢印ボタンでの移動
  const moveUp = (index) => {
    if (index === 0 || disabled) return;
    
    const reorderedFiles = [...files];
    const item = reorderedFiles[index];
    reorderedFiles.splice(index, 1);
    reorderedFiles.splice(index - 1, 0, item);
    
    onReorder?.(reorderedFiles);
  };

  const moveDown = (index) => {
    if (index === files.length - 1 || disabled) return;
    
    const reorderedFiles = [...files];
    const item = reorderedFiles[index];
    reorderedFiles.splice(index, 1);
    reorderedFiles.splice(index + 1, 0, item);
    
    onReorder?.(reorderedFiles);
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>写真の並び替え</h4>
        <p>ドラッグ&ドロップまたは矢印ボタンで順序を変更できます</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="photo-list" isDropDisabled={disabled}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`${styles.list} ${snapshot.isDraggingOver ? styles.dragOver : ''}`}
            >
              {files.map((fileData, index) => (
                <Draggable
                  key={fileData.id}
                  draggableId={fileData.id}
                  index={index}
                  isDragDisabled={disabled}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${styles.item} ${
                        snapshot.isDragging ? styles.dragging : ''
                      } ${primaryFileId === fileData.id ? styles.primary : ''}`}
                    >
                      <div
                        {...provided.dragHandleProps}
                        className={styles.dragHandle}
                      >
                        <span className={styles.dragIcon}>⋮⋮</span>
                      </div>

                      <div className={styles.orderNumber}>
                        {index + 1}
                      </div>

                      <div className={styles.preview}>
                        <img
                          src={fileData.previewUrl}
                          alt={fileData.name}
                          className={styles.previewImage}
                        />
                        {primaryFileId === fileData.id && (
                          <div className={styles.primaryBadge}>
                            ⭐ メイン
                          </div>
                        )}
                      </div>

                      <div className={styles.info}>
                        <div className={styles.fileName}>{fileData.name}</div>
                        <div className={styles.fileSize}>{formatFileSize(fileData.size)}</div>
                      </div>

                      {!disabled && (
                        <div className={styles.controls}>
                          <div className={styles.moveButtons}>
                            <button
                              onClick={() => moveUp(index)}
                              disabled={index === 0}
                              className={styles.moveButton}
                              title="上に移動"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveDown(index)}
                              disabled={index === files.length - 1}
                              className={styles.moveButton}
                              title="下に移動"
                            >
                              ↓
                            </button>
                          </div>

                          <button
                            onClick={() => onSetPrimary?.(fileData.id)}
                            disabled={primaryFileId === fileData.id}
                            className={`${styles.actionButton} ${styles.primaryButton}`}
                            title="メイン写真に設定"
                          >
                            ⭐
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {files.length > 1 && (
        <div className={styles.footer}>
          <p className={styles.hint}>
            💡 ヒント: 最初の写真が一覧で最初に表示されます
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoSorter;