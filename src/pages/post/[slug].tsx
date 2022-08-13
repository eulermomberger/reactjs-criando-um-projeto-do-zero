import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import * as prismicH from '@prismicio/helpers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  function getReadTime(): number {
    return Math.ceil(
      post.data.content.reduce((acc, current) => {
        return (
          acc +
          current.heading.split(' ').length +
          current.body
            .map(b => b.text)
            .join()
            .split(' ').length
        );
      }, 0) / 200
    );
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>

      <Header />

      {!router.isFallback ? (
        <main>
          <section className={styles.banner}>
            <img src={post.data.banner.url} alt="" />
          </section>

          <article className={commonStyles.container}>
            <section className={styles.postSection}>
              <h1>{post.data.title}</h1>
              <div className={styles.postInfo}>
                <small>
                  <FiCalendar />
                  {format(
                    new Date(post.first_publication_date),
                    'dd LLL yyyy',
                    { locale: ptBR }
                  )}
                </small>
                <small>
                  <FiUser />
                  {post.data.author}
                </small>
                <small>
                  <FiClock />
                  {getReadTime()} min
                </small>
              </div>
            </section>
            <section className={styles.postSection}>
              {post.data.content.map(content => (
                <div key={content.heading} className={styles.postContent}>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: prismicH.asHTML(content.body),
                    }}
                  />
                </div>
              ))}
            </section>
          </article>
        </main>
      ) : (
        <main className={commonStyles.container}>
          <div className={styles.postSection}>
            <h1>Carregando...</h1>
          </div>
        </main>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: { post: response },
    redirect: 60 * 60,
  };
};
