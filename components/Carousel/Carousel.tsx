// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

// import required modules
import { Autoplay } from 'swiper/modules';

import styles from "./Carousel.module.css";

import Image1 from '../../public/carousel/image1.png'; 
import CarouselSlide from './CarouselSlide';

const Carousel = () => {
  return (
      <Swiper
        className={styles.swiper}
        freeMode={true}
        allowTouchMove={false}
        spaceBetween={96} // Adjust the space between slides as needed
        speed={8000}
        slidesPerView={4} // Number of slides visible at once
        loop={true} // Enable loop mode for infinite scrolling
        autoplay={{
          delay: 0, // delay between slides
          disableOnInteraction: false, // Continue autoplay even on user interaction
        }}
        modules={[Autoplay]}
      >
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image1.png"} image2Src={"/carousel/image2.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image3.avif"} image2Src={"/carousel/image4.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image5.avif"} image2Src={"/carousel/image6.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image7.gif"} image2Src={"/carousel/image8.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image9.avif"} image2Src={"/carousel/image10.png"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image1.png"} image2Src={"/carousel/image2.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image3.avif"} image2Src={"/carousel/image4.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image5.avif"} image2Src={"/carousel/image6.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image7.gif"} image2Src={"/carousel/image8.avif"} />
        </SwiperSlide>
        <SwiperSlide>
            <CarouselSlide image1Src={"/carousel/image9.avif"} image2Src={"/carousel/image10.png"} />
        </SwiperSlide>
      </Swiper>
  );
};

export default Carousel;
