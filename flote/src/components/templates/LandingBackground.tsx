type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function LandingBackground({ className, children }: Props) {
  return (
    <div className="bg-landing bg-no-repeat bg-cover bg-center bg-fixed h-screen w-screen">
      <div className={`backdrop-blur-[2px] p-6 h-screen w-screen ${className}`}>
        {children}
      </div>
    </div>
  );
}
