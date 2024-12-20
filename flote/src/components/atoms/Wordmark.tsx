import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

type Props = {
  isLink?: boolean;
  className?: string;
};

export default function Wordmark({ isLink = true, className }: Props) {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  const goToHome = () => navigate(isAuthenticated ? "/home" : "/");

  return (
    <h1
      className={`font-header font-bold text-white ${className}`}
      onClick={isLink ? goToHome : () => {}}
    >
      <span className={isLink ? "cursor-pointer" : ""}>flotE</span>
    </h1>
  );
}
