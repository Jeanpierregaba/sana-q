
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1C5.03 1 1 5.03 1 10C1 14.97 5.03 19 10 19C14.97 19 19 14.97 19 10C19 5.03 14.97 1 10 1ZM10 17C6.13 17 3 13.87 3 10C3 6.13 6.13 3 10 3C13.87 3 17 6.13 17 10C17 13.87 13.87 17 10 17Z" fill="currentColor" className="text-primary"/>
            <path d="M10.5 6H9V11H14V9.5H10.5V6Z" fill="currentColor" className="text-primary"/>
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Page non trouvée</h1>
          <p className="text-muted-foreground mb-6">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app">Tableau de bord</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
