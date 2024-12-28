import styles from "./page.module.css";


export default function MobilePage() {
    return (
        <div style={{ display: 'flex', height: '80svh', width: '100svw', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', padding: '0px 40px', boxSizing: 'border-box' }}>
            <div className={styles.title}>
                Mu<span style={{ color: 'hsl(var(--fuchsia-500))' }}>V</span>iew
            </div>
            <div className={styles.subTitle}>
                A Music Review Visualization Platform.
            </div>
            <p style={{ marginTop: '40px' }}>Unfortunately, MuView is not available on mobile devices. Please use a desktop to experience all the features that MuView has to offer.</p>
        </div>
    );
}