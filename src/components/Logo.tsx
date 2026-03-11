interface LogoProps {
  size?: string;
  className?: string;
}

const Logo = ({ size = "w-9 h-9", className = "" }: LogoProps) => {
  return (
    <>
      <img
        src="/logo-dark.png"
        alt="KnowIt AI"
        className={`${size} ${className} block dark:hidden`}
      />
      <img
        src="/logo-light.png"
        alt="KnowIt AI"
        className={`${size} ${className} hidden dark:block`}
      />
    </>
  );
};

export default Logo;
