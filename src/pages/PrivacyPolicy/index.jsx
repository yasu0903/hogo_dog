// src/pages/PrivacyPolicy/index.jsx
import React from 'react';
import styles from './PrivacyPolicy.module.css';
import { PRIVACY_POLICY_CONST } from '../../constants/privacyPolicy';

const PrivacyPolicy = () => {
  React.useEffect(() => {
    document.title = PRIVACY_POLICY_CONST.TITLE;
  }, []);
  
  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1>プライバシーポリシー</h1>
        <p className={styles.lastUpdated}>{PRIVACY_POLICY_CONST.LAST_UPDATED_AT}</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. はじめに</h2>
          <p>
            「保護犬団体検索サイト」（以下、「当サイト」といいます）は、ユーザーのプライバシーを尊重し、
            個人情報の保護に努めています。このプライバシーポリシーでは、当サイトが収集する情報と
            その利用方法について説明します。
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. 収集する情報</h2>
          <p>当サイトでは、以下の情報を収集することがあります：</p>
          <ul>
            <li>検索履歴や閲覧履歴などの利用状況</li>
            <li>ブラウザの種類、IPアドレス、アクセス日時などの技術的情報</li>
            <li>お問い合わせいただいた際のメールアドレスや内容</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. 情報の利用目的</h2>
          <p>収集した情報は、以下の目的で利用します：</p>
          <ul>
            <li>サイトの利便性や機能の向上</li>
            <li>統計データの作成と分析</li>
            <li>お問い合わせへの対応</li>
            <li>サービス改善のための調査・分析</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Cookieの使用</h2>
          <p>
            当サイトでは、ユーザー体験の向上やサイト利用状況の分析のためにCookieを使用しています。
            Cookieはブラウザの設定から無効にすることが可能ですが、その場合一部の機能が利用できなくなる
            可能性があります。
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. 第三者への情報提供</h2>
          <p>
            当サイトでは、以下の場合を除き、収集した情報を第三者に提供することはありません：
          </p>
          <ul>
            <li>法令に基づく場合</li>
            <li>ユーザーの同意がある場合</li>
            <li>個人を特定できない形で統計データとして提供する場合</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. 情報の保護</h2>
          <p>
            当サイトでは、収集した情報の漏洩、紛失、改ざんなどを防ぐために、適切なセキュリティ対策を
            講じています。ただし、インターネット上での情報のやり取りには常にリスクが伴うことをご了承ください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. お子様のプライバシー</h2>
          <p>
            当サイトは、16歳未満の方から意図的に個人情報を収集することはありません。
            16歳未満のお子様が当サイトを利用する場合は、保護者の同意と監督のもとで行ってください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. プライバシーポリシーの変更</h2>
          <p>
            当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
            変更があった場合は、当ページにて告知します。定期的に内容をご確認いただくことをおすすめします。
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. お問い合わせ</h2>
          <p>
            プライバシーポリシーに関するご質問やご不明点がございましたら、
            以下のXアカウントまでお問い合わせください。
          </p>
          <p className={styles.contact}>
            X: https://x.com/yasuch
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;