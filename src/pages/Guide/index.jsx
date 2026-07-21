// src/pages/Guide/index.jsx
// 里親ガイドの記事ページ（/guides/:slug）。コンテンツは src/content/guides に静的定義され
// JSバンドルに含まれるため、loader なしで SSG のHTMLに本文まで焼かれる。
// SEO/OGP はルート側の RouteSeo が seo-meta から設定する。
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import JsonLd from '../../components/common/JsonLd';
import { getGuide, GUIDES } from '../../content/guides/guides';
import { GUIDES_MESSAGES } from '../../constants/locales/ja';
import { SITE } from '../../constants/site';
import styles from './Guide.module.css';

const Guide = () => {
  const { slug } = useParams();
  const guide = getGuide(slug);

  if (!guide) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <h1>{GUIDES_MESSAGES.NOT_FOUND}</h1>
          <Link to="/guides">{GUIDES_MESSAGES.BACK_TO_GUIDES}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const url = `${SITE.BASE_URL}/guides/${guide.slug}`;
  const related = GUIDES.filter((g) => g.slug !== guide.slug);

  // 記事の構造化データ（Article）
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: SITE.NAME, url: SITE.BASE_URL },
    publisher: { '@type': 'Organization', name: SITE.NAME, url: SITE.BASE_URL },
  };
  // Q&A がある記事は FAQPage も出力
  const faqLd = guide.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: GUIDES_MESSAGES.BREADCRUMB_HOME, item: `${SITE.BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: GUIDES_MESSAGES.BREADCRUMB_GUIDES, item: `${SITE.BASE_URL}/guides` },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ],
  };

  return (
    <div className={styles.container}>
      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}
      <JsonLd data={breadcrumbLd} />
      <Header />
      <main className={styles.main}>
        <nav className={styles.breadcrumb} aria-label="パンくずリスト">
          <Link to="/">{GUIDES_MESSAGES.BREADCRUMB_HOME}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link to="/guides">{GUIDES_MESSAGES.BREADCRUMB_GUIDES}</Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span>{guide.title}</span>
        </nav>

        <article className={styles.article}>
          <h1 className={styles.title}>{guide.title}</h1>
          <p className={styles.updated}>{GUIDES_MESSAGES.UPDATED(guide.updated)}</p>
          <p className={styles.intro}>{guide.intro}</p>

          {guide.sections.map((section, i) => (
            <section key={i} className={styles.section}>
              <h2 className={styles.sectionHeading}>{section.heading}</h2>
              {section.paragraphs?.map((p, j) => (
                <p key={j} className={styles.paragraph}>{p}</p>
              ))}
              {section.list && (
                <ul className={styles.list}>
                  {section.list.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {guide.faq?.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionHeading}>{GUIDES_MESSAGES.FAQ_HEADING}</h2>
              <dl className={styles.faq}>
                {guide.faq.map((item, i) => (
                  <div key={i} className={styles.faqItem}>
                    <dt className={styles.faqQ}>{item.q}</dt>
                    <dd className={styles.faqA}>{item.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </article>

        <aside className={styles.cta}>
          <h2 className={styles.ctaHeading}>{GUIDES_MESSAGES.CTA_HEADING}</h2>
          <p className={styles.ctaText}>{GUIDES_MESSAGES.CTA_TEXT}</p>
          <Link to="/organizations" className={styles.ctaLink}>{GUIDES_MESSAGES.CTA_LINK}</Link>
        </aside>

        {related.length > 0 && (
          <nav className={styles.related} aria-label={GUIDES_MESSAGES.RELATED_HEADING}>
            <h2 className={styles.relatedHeading}>{GUIDES_MESSAGES.RELATED_HEADING}</h2>
            <ul className={styles.relatedList}>
              {related.map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`}>{g.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Guide;
