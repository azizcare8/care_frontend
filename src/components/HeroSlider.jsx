"use client";
import ImageSlider from "./ImageSlider";
import { useRouter } from "next/navigation";

export default function HeroSlider() {
  const router = useRouter();

  const handleCTAClick = (slideIndex) => {
    switch(slideIndex) {
      case 0:
      case 1:
        router.push("/campaigns");
        break;
      case 2:
        router.push("/volunteer");
        break;
      case 3:
        router.push("/campaigns");
        break;
      default:
        router.push("/campaigns");
    }
  };

  return (
    <section className="relative w-full max-w-full min-h-[600px] md:min-h-[700px] lg:min-h-[800px] overflow-visible pt-16">
      <ImageSlider 
        autoPlay={true} 
        interval={3000}
        showContent={true}
        onCTAClick={handleCTAClick}
        fullWidth={true}
      />
    </section>
  );
}

