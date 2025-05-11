
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Check } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4ZM8.5 10H7.5V8.5H6V7.5H7.5V6H8.5V7.5H10V8.5H8.5V10Z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-semibold">MediSync</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button>S'inscrire</Button>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
            Gestion des rendez-vous médicaux simplifiée
          </h1>
          <p className="max-w-[600px] text-lg text-muted-foreground mb-8">
            MediSync transforme l'expérience des patients et des prestataires de soins en Afrique. Planifiez, gérez et optimisez vos rendez-vous médicaux sans tracas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg">Commencer maintenant</Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                En savoir plus
              </Button>
            </a>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section id="features" className="py-16 bg-secondary/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Prise de rendez-vous en ligne</h3>
              <p className="text-muted-foreground">Planifiez facilement des rendez-vous avec les prestataires de soins de votre choix.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rappels et notifications</h3>
              <p className="text-muted-foreground">Recevez des rappels automatiques pour vos rendez-vous et des mises à jour en temps réel.</p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Recherche de médecins</h3>
              <p className="text-muted-foreground">Trouvez rapidement des médecins et spécialistes qualifiés dans votre région.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir MediSync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Réduction des temps d'attente</p>
                  <p className="text-muted-foreground">Optimisation des flux de patients pour réduire l'attente dans les établissements de santé.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Meilleure expérience patient</p>
                  <p className="text-muted-foreground">Interface intuitive conçue pour tous les niveaux de compétence technologique.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Gestion efficace pour les établissements</p>
                  <p className="text-muted-foreground">Optimisez votre agenda et réduisez les absences aux rendez-vous.</p>
                </div>
              </li>
            </ul>
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Adapté aux réalités africaines</p>
                  <p className="text-muted-foreground">Fonctionne même avec une connectivité limitée et sur divers appareils.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Assistance IA intégrée</p>
                  <p className="text-muted-foreground">Recommandations personnalisées et optimisation des plannings.</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Applications web et mobile</p>
                  <p className="text-muted-foreground">Accédez au service depuis n'importe quel appareil, n'importe où.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à améliorer votre expérience de santé?</h2>
          <p className="max-w-[600px] mx-auto mb-8">
            Rejoignez des milliers d'utilisateurs qui transforment déjà leur expérience de soins de santé avec MediSync.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg">S'inscrire maintenant</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="bg-transparent hover:bg-primary-foreground/10">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3C4.34 3 3 4.34 3 6C3 7.66 4.34 9 6 9C7.66 9 9 7.66 9 6C9 4.34 7.66 3 6 3ZM6.5 7.5H5.5V6.5H4.5V5.5H5.5V4.5H6.5V5.5H7.5V6.5H6.5V7.5Z" fill="white"/>
                </svg>
              </div>
              <span className="text-sm font-semibold">MediSync</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; 2025 MediSync. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
