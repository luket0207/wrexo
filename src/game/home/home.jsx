import Button, { BUTTON_VARIANT } from "../../engine/ui/button/button";
import "./home.scss";

const Home = () => {
  return (
    <div className="home">
      <div className="home_content">
        <h1>Mini React Game Engine</h1>
        <Button variant={BUTTON_VARIANT.PRIMARY} to="/debug">
          Go to Debug Page
        </Button>
      </div>
    </div>
  );
};

export default Home;
