import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <nav className={commonStyles.container}>
      <div className={styles.header}>
        <Link href="/">
          <img
            className={styles.img}
            src="/images/logo.svg"
            alt="logo"
            width={239}
            height={27}
          />
        </Link>
      </div>
    </nav>
  );
}
