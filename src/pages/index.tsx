import Layout from "@theme/Layout";
import styles from "./index.module.css";

export default function Home(): React.ReactNode {
  return (
    <Layout title="首页" description="LTLYLFUN">
      <div className={styles.container}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>LTLYLFUN</h1>
        </div>
      </div>
    </Layout>
  );
}
