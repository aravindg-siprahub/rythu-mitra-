const AnnouncementBar = () => {
  const text = "🇮🇳 Empowering Indian Agriculture with AI  •  Free Forever  •  Made with ❤️ in India  •  ";
  return (
    <div className="green-gradient-bg overflow-hidden py-2">
      <div className="marquee-fast whitespace-nowrap">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-sm font-medium text-primary-foreground px-4">{text}</span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
