import { useParams } from "react-router-dom";
import { useEffect } from "react";
const Project: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    console.log("Project component mounted");
    console.log("Project ID:", slug);
  }, [slug]);

  return (
    <div>
      <h1>Project {slug}</h1>
    </div>
  );
};

export default Project;
