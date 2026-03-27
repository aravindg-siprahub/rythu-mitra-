export default function AnnouncementBar() {
  return (
    <div className="bg-green-gradient-light overflow-hidden py-2">
      <div className="animate-marquee-fast flex whitespace-nowrap">
        {[0, 1, 2].map((i) => (
          <span key={i} className="mx-8 text-sm font-medium text-primary-foreground">
            Crop recommendations · Disease guidance from photos · Weather-aware advisories · Mandi
            price context — sign in to use the full console
          </span>
        ))}
      </div>
    </div>
  );
}
