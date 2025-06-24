import Image from "next/image";

const SmallLogo = () => {
  return (
    <Image
      src="/Снимок_экрана_2025_06_24_в_19,02,27_Picsart_BackgroundRemover.png"
      alt="Small Logo"
      width={50}
      height={50}
      priority
      style={{objectFit: 'contain'}}
    />
  );
};

export default SmallLogo;
