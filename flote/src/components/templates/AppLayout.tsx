import Background from "@atoms/Background";
import Header from "@molecules/Header";
import PageTitle from "@atoms/PageTitle";
import FreepikAttribution from "@atoms/FreepikAttribution";
import Footer from "@molecules/Footer/Footer";

type Props = {
  title?: string;
  subtitle?: string;
  hideBackButton?: boolean;
  children: React.ReactNode;
  className?: string;
  titleMargin?: string;
};

export default function AppLayout({
  title,
  subtitle,
  hideBackButton = false,
  children,
  className,
  titleMargin,
}: Props) {
  return (
    <Background className="justify-between bg-white/40">
      <Header className="px-8 lg:px-[5%] xl:px-[15%]" />
      <main className="grow flex flex-col m-8 lg:mx-[5%] xl:mx-[15%]">
        {title && (
          <PageTitle
            title={title}
            subtitle={subtitle}
            hideBackButton={hideBackButton}
            marginX={titleMargin}
          ></PageTitle>
        )}
        <div className={`grow ${className}`}>{children}</div>
      </main>
      <FreepikAttribution />
      {/* <Footer className="px-8 lg:px-[5%] xl:px-[15%]" /> */}
    </Background>
  );
}
