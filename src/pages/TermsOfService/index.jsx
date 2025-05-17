// src/pages/TermsOfService/index.jsx
import React from 'react';
import styles from './TermsOfService.module.css';
import { TERMS_OF_SERVICE_CONST } from '../../constants/termsOfService';

const TermsOfService = () => {
  // document.titleを使用してタイトルを設定
  React.useEffect(() => {
    document.title = '利用規約 | 保護犬団体検索サイト';
  }, []);
  
  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h1>利用規約</h1>
        <p className={styles.lastUpdated}>{TERMS_OF_SERVICE_CONST.LAST_UPDATED_AT}</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>1. 利用規約について</h2>
          <p>
            この利用規約（以下、「本規約」といいます）は、「保護犬団体検索サイト」（以下、「当サイト」といいます）が
            提供するサービスの利用条件を定めるものです。ユーザーの皆様（以下、「ユーザー」といいます）には、
            本規約に同意いただいた上で、当サイトをご利用いただくものとします。
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. サービス内容</h2>
          <p>
            当サイトは、保護犬活動を行う団体の情報を掲載し、ユーザーが検索できるサービスを提供しています。
            当サイトに掲載されている情報は、各団体から提供された情報に基づいていますが、その正確性、
            完全性、最新性等を保証するものではありません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. 禁止事項</h2>
          <p>当サイトの利用にあたり、以下の行為を禁止します：</p>
          <ul>
            <li>法令または公序良俗に反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当サイトのサーバーやネットワークの機能を破壊したり、妨害したりする行為</li>
            <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>当サイトが掲載する情報を不正に改ざんする行為</li>
            <li>当サイトの運営者および掲載団体、他のユーザーを誹謗中傷する行為</li>
            <li>その他、当サイトが不適切と判断する行為</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. 知的財産権</h2>
          <p>
            当サイトに掲載されているテキスト、画像、デザイン等の著作物の著作権は、当サイトまたは
            正当な権利者に帰属します。ユーザーは、これらの著作物を無断で複製、使用、転載することはできません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. 免責事項</h2>
          <ul>
            <li>
              当サイトに掲載されている団体情報の正確性、完全性、適時性、有用性等について、いかなる保証もいたしません。
            </li>
            <li>
              ユーザーが当サイトを利用したことによって生じた損害について、当サイトは一切の責任を負いません。
            </li>
            <li>
              当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される
              情報、サービス等について一切の責任を負いません。
            </li>
            <li>
              当サイトのコンテンツ・情報の提供の中断、遅延、中止、データの消失等について、一切の責任を負いません。
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. 掲載団体との関係</h2>
          <p>
            当サイトは、掲載されている保護犬団体と提携、協力関係にある場合がありますが、
            全ての団体と直接的な関係があるわけではありません。団体への問い合わせや支援は、
            ユーザー自身の責任において行ってください。
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. サービスの変更・中断・終了</h2>
          <p>
            当サイトは、事前の告知なく、本サービスの内容の変更、中断、終了をすることがあり、
            これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. 利用規約の変更</h2>
          <p>
            当サイトは、必要に応じて本規約を変更することがあります。変更後の利用規約は、
            当サイトに掲載された時点から効力を生じるものとします。
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. 準拠法と管轄裁判所</h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。
            当サイトに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. お問い合わせ</h2>
          <p>
            本規約に関するご質問やご不明点がございましたら、以下のXアカウントまでお問い合わせください。
          </p>
          <p className={styles.contact}>
            X: https://x.com/yasuch
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;