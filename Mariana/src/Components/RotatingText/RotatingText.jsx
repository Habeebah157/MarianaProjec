import { useState, useEffect } from "react";

const RotatingText = () => {
  const words = ["Businesses", "Events", "Community"];
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    let timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
      }, 100);
    }

    if (!isDeleting && displayedText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 1000); // pause before deleting
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, index]);

  return (
    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
      Find Muslim <span className="text-blue-600">{displayedText}</span>
      <span className="animate-pulse">|</span>
    </h1>
  );
};

export default RotatingText;
