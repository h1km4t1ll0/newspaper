import Image from "next/image";

const Logo = ({width = 160, height = 160}: {width?: number, height?: number}) => {
  return (
    <Image
      src="/Снимок_экрана_2025_06_24_в_19,02,27_Picsart_BackgroundRemover.png"
      alt="Logo"
      width={width}
      height={height}
      priority
      style={{objectFit: 'contain'}}
    />
  );
};

export default Logo;
