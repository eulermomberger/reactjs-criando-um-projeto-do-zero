import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(postsPagination.results);

  async function handleLoadMore(): Promise<void> {
    try {
      fetch(nextPage)
        .then(response => response.json())
        .then(data => {
          setPosts([...posts, ...data.results]);
          setNextPage(data.next_page);
        });
    } catch {
      alert('Ocorreu um erro por favor recarrege a página!');
    }
  }

  return (
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
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
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <div className={styles.loadMore}>
            <button type="button" onClick={handleLoadMore}>
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 2 });

  return {
    props: {
      postsPagination: postsResponse,
    },
    redirect: 60 * 30,
  };
};
