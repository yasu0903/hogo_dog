// src/pages/Feedback/index.jsx
// 掲載情報の提供・修正依頼ページ。敷居の低い順（X → GitHub Issue → PR）に案内する。
// 連絡先URL・誘導文言は FEEDBACK_MESSAGES（ja.js）に集約。本文の説明文はこのファイルにインライン
// （PrivacyPolicy / TermsOfService と同じ静的文章ページのパターン）。
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import styles from './Feedback.module.css';
import { FEEDBACK_MESSAGES } from '../../constants/locales/ja';

const Feedback = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{FEEDBACK_MESSAGES.TITLE}</h1>
        <p className={styles.lead}>
          「この団体・スポットも載せてほしい」「情報が古い・間違っている」「閉鎖されている」
          などに気づいたら、以下のいずれかの方法でお知らせください。
          いただいた情報は運営が確認のうえ、データ更新時に反映します。
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faXTwitter} className={styles.sectionIcon} />
            X（旧Twitter）で連絡 — いちばん簡単です
          </h2>
          <p>
            <a href={FEEDBACK_MESSAGES.X_URL} target="_blank" rel="noopener noreferrer">
              {FEEDBACK_MESSAGES.X_HANDLE}
            </a>{' '}
            へリプライまたはDMでお知らせください。
            次の3点を書いていただけると、確認がスムーズです。
          </p>
          <ol className={styles.pointList}>
            <li><strong>団体名 / スポット名と都道府県</strong></li>
            <li><strong>内容</strong>（新しく載せてほしい・情報の修正・閉鎖/リンク切れ など）</li>
            <li><strong>確認できるURL</strong>（公式サイト・公式SNSなど）</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FontAwesomeIcon icon={faGithub} className={styles.sectionIcon} />
            GitHub Issue で報告
          </h2>
          <p>
            GitHubアカウントをお持ちの方は
            <a href={FEEDBACK_MESSAGES.ISSUE_URL} target="_blank" rel="noopener noreferrer">
              報告フォーム
            </a>
            からどうぞ。フォームに沿って入力するだけで送信できます。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🛠 開発者の方へ</h2>
          <p>
            データファイルを直接編集したプルリクエストも歓迎です。編集ルールは
            <a href={FEEDBACK_MESSAGES.CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer">
              CONTRIBUTING.md
            </a>
            をご覧ください。
          </p>
        </section>

        <section className={styles.notes}>
          <h2 className={styles.sectionTitle}>掲載についてのご留意</h2>
          <ul>
            <li>公式サイト・自治体の公表資料などで確認できる情報のみ掲載しています</li>
            <li>個人情報保護の方針により、電話番号は掲載していません</li>
            <li>反映は定期のデータ更新のタイミングになります。お時間をいただく場合があります</li>
            <li>内容によっては掲載を見送る場合があります。ご了承ください</li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
