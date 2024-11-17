import Logo from "@atoms/Logo";

type Props = {
  className?: string;
};

export default function Footer({ className }: Props) {
  return (
    <div className={`py-4 bg-slate-800 text-white waveAnimation ${className}`}>
      <Logo className="text-2xl"/>
    </div>
  );
}
