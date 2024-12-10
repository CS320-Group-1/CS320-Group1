import Wordmark from "@atoms/Wordmark";

type Props = {
  className?: string;
};

export default function Footer({ className }: Props) {
  return (
    <div className={`py-4 bg-slate-800 text-white waveAnimation ${className}`}>
      <Wordmark isLink className="text-2xl" />
    </div>
  );
}
