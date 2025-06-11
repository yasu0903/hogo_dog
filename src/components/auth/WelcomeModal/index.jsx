import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomeModal.module.css';

const WelcomeModal = ({ user, onClose, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible || !user?.isNewUser) {
    return null;
  }

  const steps = [
    {
      title: 'わんだーネットへようこそ！',
      content: (
        <div className={styles.stepContent}>
          <div className={styles.welcomeIcon}>🎉</div>
          <p>
            <strong>{user.name}</strong>さん、わんだーネットへの登録が完了しました！
          </p>
          <p>
            このプラットフォームでは、保護犬・保護猫の里親探しをサポートし、
            動物たちと素敵な家族との出会いをお手伝いします。
          </p>
        </div>
      )
    },
    {
      title: 'できること',
      content: (
        <div className={styles.stepContent}>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔍</span>
              <div>
                <h4>動物検索</h4>
                <p>お住まいの地域や条件に合った保護動物を見つけられます</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🏢</span>
              <div>
                <h4>保護団体情報</h4>
                <p>全国の動物保護団体・施設の情報を確認できます</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👤</span>
              <div>
                <h4>マイページ</h4>
                <p>プロフィール設定や通知設定を管理できます</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'はじめましょう！',
      content: (
        <div className={styles.stepContent}>
          <div className={styles.startIcon}>🚀</div>
          <p>準備完了です！早速、新しい家族になるかもしれない動物たちを探してみませんか？</p>
          <div className={styles.actionButtons}>
            <Link to="/animals" className={styles.primaryButton} onClick={onClose}>
              動物を探す
            </Link>
            <Link to="/mypage" className={styles.secondaryButton} onClick={onClose}>
              プロフィール設定
            </Link>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{currentStepData.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {currentStepData.content}
        </div>
        
        <div className={styles.modalFooter}>
          <div className={styles.stepIndicator}>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
              />
            ))}
          </div>
          
          <div className={styles.navigationButtons}>
            {currentStep > 0 && (
              <button onClick={prevStep} className={styles.navButton}>
                前へ
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button onClick={nextStep} className={styles.navButton}>
                次へ
              </button>
            ) : (
              <button onClick={onClose} className={styles.navButton}>
                完了
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;