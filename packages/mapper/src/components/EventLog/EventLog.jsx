import styles from './EventLog.module.css';

export default function EventLog({ events }) {
  return (
    <div className={styles.eventLog}>
      <div className={styles.header}>
        <span className={styles.title}>Event Log</span>
        <span className={styles.count}>{events.length} events</span>
      </div>
      <div className={styles.eventList}>
        {events.length === 0 ? (
          <div className={styles.emptyState}>No events yet</div>
        ) : (
          [...events].reverse().map((event, index) => (
            <div key={index} className={styles.eventItem}>
              <span className={styles.timestamp}>{event.timestamp}</span>
              <span className={styles.eventType}>{event.type}</span>
              <span className={styles.eventMessage}>{event.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
