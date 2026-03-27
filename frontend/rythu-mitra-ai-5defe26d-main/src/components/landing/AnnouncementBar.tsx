const AnnouncementBar = () => (
  <div className="bg-green-gradient-light overflow-hidden py-2">
    <div className="animate-marquee-fast flex whitespace-nowrap">
      {[...Array(3)].map((_, i) => (
        <span key={i} className="mx-8 text-sm font-medium text-primary-foreground">
          🌿 AI-Powered Crop Recommendations &nbsp;•&nbsp; Instant Disease Detection &nbsp;•&nbsp; Live Mandi Prices &nbsp;•&nbsp; 100% Free for Farmers &nbsp;&nbsp;&nbsp;
        </span>
      ))}
    </div>
  </div>
);
export default AnnouncementBar;
