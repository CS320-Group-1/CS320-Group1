import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Background from "@atoms/Background";
import { Button } from "@nextui-org/button";
import FreepikAttribution from "@atoms/FreepikAttribution";
import SearchBar from "@atoms/SearchBar";
import Wordmark from "@atoms/Wordmark";

export default function Landing() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/home");
  }, [isAuthenticated, navigate]);

  return (
    <Background className="bg-gradient-to-b from-slate-800">
      <Button
        color="primary"
        size="lg"
        radius="sm"
        onPress={() => loginWithRedirect()}
        className="self-end w-32 m-6"
      >
        sign in
      </Button>
      <div className="grow flex flex-col items-center justify-center pb-44">
        <Wordmark isLink={false} className="text-[96px] mb-6" />
        <SearchBar size="lg" className="w-72 sm:w-96 lg:w-[600px]" />
      </div>
      <FreepikAttribution />
    </Background>
  );
}
