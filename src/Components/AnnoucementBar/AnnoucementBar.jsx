import './Marquee.css';

function AnnouncementBar({ orders }) {
    const pendingCount = orders.filter(
    (o) => (o.paymentStatus || o.status) === 'Pending'
  ).length;

  if (pendingCount === 0) return null;
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        <span>🔥ATTENTION ADMIN: You have {pendingCount} pending order(s) awaiting payment approval! 🔥</span>
      </div>
    </div>
  );
}

export default AnnouncementBar;