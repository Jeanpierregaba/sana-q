
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

// Mock data
const doctors = [
  {
    id: 1,
    name: "Dr. Konaté Amadou",
    specialty: "Cardiologie",
    hospital: "Hôpital Central",
    location: "Abidjan",
    rating: 4.9,
    reviewCount: 128,
    availability: "Disponible le 18 Mai",
  },
  {
    id: 2,
    name: "Dr. Diallo Fatoumata",
    specialty: "Dentiste",
    hospital: "Clinique Dentaire du Centre",
    location: "Dakar",
    rating: 4.7,
    reviewCount: 86,
    availability: "Disponible le 15 Mai",
  },
  {
    id: 3,
    name: "Dr. Touré Ibrahim",
    specialty: "Dermatologie",
    hospital: "Centre Dermatologique",
    location: "Bamako",
    rating: 4.8,
    reviewCount: 103,
    availability: "Disponible le 20 Mai",
  },
  {
    id: 4,
    name: "Dr. Ouattara Mariam",
    specialty: "Médecine Générale",
    hospital: "Centre Médical Région Sud",
    location: "Abidjan",
    rating: 4.5,
    reviewCount: 215,
    availability: "Disponible demain",
  },
  {
    id: 5,
    name: "Dr. Sanogo Adama",
    specialty: "Ophtalmologie",
    hospital: "Clinique Visuelle",
    location: "Ouagadougou",
    rating: 4.6,
    reviewCount: 94,
    availability: "Disponible le 14 Mai",
  },
];

// List of specialties
const specialties = [
  "Toutes les spécialités",
  "Cardiologie",
  "Dentiste",
  "Dermatologie",
  "Médecine Générale",
  "Ophtalmologie",
];

// List of locations
const locations = [
  "Toutes les villes",
  "Abidjan",
  "Bamako",
  "Dakar",
  "Ouagadougou",
];

const DoctorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Toutes les spécialités");
  const [selectedLocation, setSelectedLocation] = useState("Toutes les villes");

  // Filter doctors based on search criteria
  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase());
                         
    const matchesSpecialty = selectedSpecialty === "Toutes les spécialités" || 
                            doctor.specialty === selectedSpecialty;
                            
    const matchesLocation = selectedLocation === "Toutes les villes" || 
                           doctor.location === selectedLocation;
                           
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const handleBooking = (doctorId: number, doctorName: string) => {
    toast.success(`Redirection vers la page de prise de rendez-vous avec ${doctorName}`, {
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trouver un médecin</h2>
        <p className="text-muted-foreground">
          Recherchez et consultez des médecins spécialistes près de chez vous.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critères de recherche</CardTitle>
          <CardDescription>
            Affinez votre recherche pour trouver le médecin qui répond à vos besoins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Recherche par nom</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom, spécialité..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="specialty" className="text-sm font-medium">Spécialité</label>
              <Select
                value={selectedSpecialty}
                onValueChange={setSelectedSpecialty}
              >
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Sélectionner une spécialité" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Ville</label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun résultat</CardTitle>
              <CardDescription>
                Aucun médecin ne correspond à vos critères de recherche. Veuillez essayer avec d'autres critères.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-xl">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({doctor.reviewCount} avis)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold">{doctor.name}</h3>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                    <p className="mt-2">{doctor.hospital}</p>
                    <div className="flex items-center justify-center md:justify-start mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="ml-1 text-sm text-muted-foreground">{doctor.location}</span>
                    </div>
                    <p className="mt-4 text-sm text-primary font-medium">{doctor.availability}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 justify-center md:justify-start">
                    <Button onClick={() => handleBooking(doctor.id, doctor.name)}>
                      Prendre rendez-vous
                    </Button>
                    <Button variant="outline">Voir le profil</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
