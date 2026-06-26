from django.core.management.base import BaseCommand
from restaurant.models import Categorie, Plat


MENU = {
    "Entrées": [
        ("Briouates au fromage et miel",        "Feuilletés croustillants farcis de fromage fondu et nappés de miel.",           35,  10),
        ("Pastilla au poulet",                   "Feuilleté sucré-salé au poulet, amandes et cannelle.",                          55,  15),
        ("Zaalouk",                              "Caviar d'aubergines grillées aux tomates, ail et cumin.",                       30,  10),
        ("Taktouka",                             "Salade chaude de poivrons rôtis et tomates à l'huile d'olive.",                 30,  10),
    ],
    "Tagines": [
        ("Tagine poulet olives & citron confit", "Poulet mijoté aux olives vertes et citrons confits, sauce safranée.",           95,  40),
        ("Tagine agneau pruneaux & amandes",     "Épaule d'agneau fondante aux pruneaux, amandes et épices douces.",              110, 50),
        ("Tagine kefta aux œufs",                "Boulettes de viande épicées en sauce tomate, œufs pochés.",                    85,  35),
        ("Tagine de légumes",                    "Assortiment de légumes de saison mijotés aux épices marocaines.",               75,  35),
    ],
    "Couscous": [
        ("Couscous royal",                       "Semoule fine avec agneau, poulet et merguez, sept légumes et bouillon.",        130, 45),
        ("Couscous poulet & légumes",            "Semoule au poulet fermier et légumes du marché.",                               95,  40),
        ("Couscous sept légumes (végétarien)",   "Semoule traditionnelle aux sept légumes, sans viande.",                         85,  35),
    ],
    "Grillades": [
        ("Brochettes d'agneau",                  "Cubes d'agneau marinés aux herbes, grillés au charbon de bois.",               90,  20),
        ("Poulet grillé aux épices",             "Demi-poulet mariné au chermoula, grillé et servi avec frites.",                85,  25),
        ("Merguez grillées",                     "Saucisses épicées maison grillées, accompagnées de pain khobz.",               75,  15),
        ("Kefta grillée",                        "Boulettes de viande hachée épicées, façonnées sur brochette.",                 80,  15),
    ],
    "Salades & Soupes": [
        ("Harira",                               "Soupe traditionnelle marocaine aux lentilles, pois chiches et tomates.",       30,  10),
        ("Salade marocaine",                     "Tomates fraîches, concombre, poivrons, oignon et persil à l'huile d'olive.",   35,  8),
        ("Chorba",                               "Soupe de vermicelles à la viande et légumes, parfumée au ras el hanout.",      30,  10),
    ],
    "Desserts": [
        ("Bastilla au lait",                     "Crêpe feuilletée à la crème pâtissière, amandes et fleur d'oranger.",          45,  10),
        ("Chebakia",                             "Gâteaux de sésame frits, imbibés de miel et parfumés à la fleur d'oranger.",   30,  5),
        ("Cornes de gazelle",                    "Pâtisseries fourrées à la pâte d'amandes et à la fleur d'oranger.",            35,  5),
        ("Fruits de saison",                     "Assortiment de fruits frais de saison.",                                       40,  5),
    ],
    "Boissons": [
        ("Thé à la menthe",                      "Thé vert traditionnel à la menthe fraîche, sucré à la marocaine.",             20,  5),
        ("Jus d'orange frais",                   "Oranges pressées à la minute.",                                                25,  5),
        ("Eau minérale",                         "Eau minérale 50cl.",                                                           15,  1),
        ("Citronnade maison",                    "Citrons pressés, eau, sucre et menthe, servis frais.",                         25,  5),
    ],
}


class Command(BaseCommand):
    help = "Seed the database with Zefran restaurant categories and dishes"

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Delete existing categories and dishes first")

    def handle(self, *args, **options):
        if options["clear"]:
            Plat.objects.all().delete()
            Categorie.objects.all().delete()
            self.stdout.write("Existing data cleared.")

        for ordre, (categorie_nom, plats) in enumerate(MENU.items(), start=1):
            cat, created = Categorie.objects.get_or_create(nom=categorie_nom, defaults={"ordre": ordre})
            if not created:
                cat.ordre = ordre
                cat.save()
            tag = "créée" if created else "existante"
            self.stdout.write(f"  [{tag}] {categorie_nom}")

            for nom, description, prix, temps in plats:
                plat, p_created = Plat.objects.get_or_create(
                    nom=nom,
                    defaults={
                        "description": description,
                        "prix": prix,
                        "categorie": cat,
                        "disponible": True,
                        "temps_preparation": temps,
                    },
                )
                tag = "+" if p_created else "="
                self.stdout.write(f"    [{tag}] {nom}  —  {prix} MAD")

        self.stdout.write(self.style.SUCCESS("\nMenu Zefran chargé avec succès !"))
