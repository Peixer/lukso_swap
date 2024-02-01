// pages/faq
import React from "react";
import styles from "./FAQ.module.css";
import { FAQCard } from "../../components/FAQCard/FAQCard";

export default function FAQ() {
  return (
    <div className={styles.faqContainer}>
      <h1 className={styles.faqTitle}>FAQ</h1>
      <p className={styles.faqSubTitle}>
        {`Don't find your question here ? Reach out to us on discord and twitter.`}
      </p>
      <FAQCard
        title="What is LuksoSwap ?"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc bibendum, dui imperdiet elementum cursus, dolor massa volutpat justo, vitae tempor sapien elit ut leo. Vestibulum porttitor sapien at odio blandit, sit amet laoreet enim ornare. Nulla vestibulum, tellus ut consectetur laoreet, mauris risus interdum tortor, vel aliquam ex purus at quam. Nam urna odio, mattis vel felis eget"
      />
      <FAQCard
        title="How does swapping on LuksoSwap work ?"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc bibendum, dui imperdiet elementum cursus, dolor massa volutpat justo, vitae tempor sapien elit ut leo. Vestibulum porttitor sapien at odio blandit, sit amet laoreet enim ornare. Nulla vestibulum, tellus ut consectetur laoreet, mauris risus interdum tortor, vel aliquam ex purus at quam. Nam urna odio, mattis vel felis eget"
      />
      <FAQCard
        title="Can I cancel a trade ?"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc bibendum, dui imperdiet elementum cursus, dolor massa volutpat justo, vitae tempor sapien elit ut leo. Vestibulum porttitor sapien at odio blandit, sit amet laoreet enim ornare. Nulla vestibulum, tellus ut consectetur laoreet, mauris risus interdum tortor, vel aliquam ex purus at quam. Nam urna odio, mattis vel felis eget"
      />
      <FAQCard
        title="Which tokens are supported ?"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc bibendum, dui imperdiet elementum cursus, dolor massa volutpat justo, vitae tempor sapien elit ut leo. Vestibulum porttitor sapien at odio blandit, sit amet laoreet enim ornare. Nulla vestibulum, tellus ut consectetur laoreet, mauris risus interdum tortor, vel aliquam ex purus at quam. Nam urna odio, mattis vel felis eget"
      />
      <FAQCard
        title="How do I know that the NFTs of my counterpart are legit ?"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc bibendum, dui imperdiet elementum cursus, dolor massa volutpat justo, vitae tempor sapien elit ut leo. Vestibulum porttitor sapien at odio blandit, sit amet laoreet enim ornare. Nulla vestibulum, tellus ut consectetur laoreet, mauris risus interdum tortor, vel aliquam ex purus at quam. Nam urna odio, mattis vel felis eget"
      />
    </div>
  );
}
