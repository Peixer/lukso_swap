// Import Swiper styles
import 'swiper/css';

import styles from "./CarouselSlide.module.css";
import Image from 'next/image';

export const SlideWidth : number = 300;

interface CarouselSlideProps {
    image1Src: string;
    image2Src: string;
  }

const CarouselSlide = ({ image1Src, image2Src } : CarouselSlideProps) => {
  return (
        <div className={styles.carouselSlide}>
            <div className={styles.imageContainer}>
                <div className={styles.imageWrapper}>
                  <Image src={image1Src} width={100} height={100} className={styles.img} alt={String(image1Src)} />
                </div>
                <Image src="/swap.png" width={25} height={25} alt="Swiper Logo" />
                <div className={styles.imageWrapper}>
                  <Image src={image2Src} width={100} height={100} className={styles.img} alt={String(image2Src)} />
                </div>
            </div>
        </div>
  );
};

export default CarouselSlide;
