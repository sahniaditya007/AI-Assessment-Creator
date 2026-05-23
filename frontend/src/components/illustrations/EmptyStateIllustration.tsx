export function EmptyStateIllustration({ size = "lg" }: { size?: "lg" | "sm" }) {
  const dim = size === "lg" ? 300 : 220;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: dim * 0.8,
          height: dim * 0.8,
          background: "linear-gradient(179.67deg, #F2F2F2 -15.9%, #EFEFEF 158.68%)",
        }}
      />
      <div
        className="absolute rounded-2xl bg-white shadow-card"
        style={{
          width: dim * 0.42,
          height: dim * 0.52,
          transform: "rotate(-2deg)",
        }}
      >
        <div className="flex flex-col gap-[18px] p-6 pt-8">
          <div className="h-2.5 w-12 rounded-full bg-navy" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2.5 w-full rounded-full bg-[#D5D5D5]" />
          ))}
        </div>
      </div>
      <div
        className="absolute rounded-full bg-white shadow-[6px_4px_13px_rgba(27,119,139,0.09)]"
        style={{ width: dim * 0.23, height: dim * 0.13, right: "8%", top: "12%" }}
      />
      <div
        className="absolute rounded-full border-4 border-[#E1DCEB] bg-gradient-to-br from-white to-[#FFADAD]/30"
        style={{
          width: dim * 0.42,
          height: dim * 0.42,
          right: "10%",
          bottom: "18%",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-[#FF4040] opacity-90" />
        </div>
      </div>
      <svg
        className="absolute left-[5%] top-[18%] text-navy"
        width={dim * 0.27}
        height={dim * 0.25}
        viewBox="0 0 82 74"
        fill="currentColor"
      >
        <path d="M10 60 Q40 10 72 50 L65 58 Q35 25 15 55 Z" />
      </svg>
      <div
        className="absolute rounded-full bg-navy-light"
        style={{ width: 12, height: 12, left: "78%", top: "55%" }}
      />
    </div>
  );
}
