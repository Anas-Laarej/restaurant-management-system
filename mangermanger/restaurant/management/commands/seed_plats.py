from django.core.management.base import BaseCommand
from restaurant.models import Categorie, Plat

MENU_EXTRA = [
    {
        "nom": "Pizzas",
        "ordre": 8,
        "plats": [
            {"nom": "Pizza Margherita",         "desc": "Base tomate San Marzano, mozzarella fior di latte, basilic frais et filet d'huile d'olive extra vierge. La classique italienne.",            "prix": 75,  "tps": 20},
            {"nom": "Pizza 4 fromages",         "desc": "Mozzarella, gorgonzola, chèvre et parmesan fondus sur une base crème fraîche. Pour les amateurs de fromage.",                               "prix": 90,  "tps": 22},
            {"nom": "Pizza Pepperoni",          "desc": "Sauce tomate maison, mozzarella filante et généreux disques de pepperoni épicé. Croustillante en bords.",                                   "prix": 88,  "tps": 20},
            {"nom": "Pizza Végétarienne",       "desc": "Poivrons colorés, champignons, olives, tomates cerises, oignons rouges et mozzarella sur base tomate.",                                    "prix": 80,  "tps": 20},
            {"nom": "Pizza Poulet BBQ",         "desc": "Sauce barbecue fumée, poulet grillé, oignons caramélisés, maïs et mozzarella. Sucrée-salée et gourmande.",                                 "prix": 88,  "tps": 22},
            {"nom": "Pizza Royale",             "desc": "Jambon, champignons, olives, poivrons et mozzarella sur fond de tomate. La préférée des familles.",                                        "prix": 85,  "tps": 20},
            {"nom": "Calzone",                  "desc": "Pizza pliée farcie de ricotta, jambon, champignons et mozzarella. Cuite au four jusqu'à dorure parfaite.",                                  "prix": 92,  "tps": 25},
        ],
    },
    {
        "nom": "Sushis & Japonais",
        "ordre": 9,
        "plats": [
            {"nom": "California Roll (8 pcs)",  "desc": "Riz vinaigré, surimi, avocat et concombre, roulés dans du nori et parsemés de tobiko. Doux et frais.",                                     "prix": 65,  "tps": 15},
            {"nom": "Salmon Roll (8 pcs)",      "desc": "Saumon frais de l'Atlantique, avocat crémeux et riz japonais vinaigré, enroulés dans feuille de nori grillée.",                            "prix": 75,  "tps": 15},
            {"nom": "Dragon Roll (8 pcs)",      "desc": "Crevettes tempura, avocat, concombre en intérieur, couverture de fines lamelles de saumon et sauce sriracha.",                             "prix": 90,  "tps": 18},
            {"nom": "Sashimi saumon (12 pcs)",  "desc": "Douze tranches épaisses de saumon ultra-frais, servies avec wasabi, gingembre mariné et sauce soja.",                                     "prix": 110, "tps": 10},
            {"nom": "Plateau Mix (24 pcs)",     "desc": "Assortiment de 24 pièces : California, Salmon roll, Thon épicé et Végétarien. Idéal pour partager.",                                      "prix": 145, "tps": 20},
            {"nom": "Ramen poulet",             "desc": "Bouillon doré au poulet mijoté 6h, nouilles ramen, œuf mollet, nori, maïs, chashu de poulet et oignons verts.",                           "prix": 85,  "tps": 20},
            {"nom": "Gyozas (6 pcs)",           "desc": "Raviolis japonais farcis de porc haché et chou, poêlés croustillants d'un côté, servis avec sauce ponzu maison.",                         "prix": 55,  "tps": 15},
        ],
    },
    {
        "nom": "Burgers",
        "ordre": 10,
        "plats": [
            {"nom": "Classic Burger",           "desc": "Steak haché bœuf 150g, cheddar fondu, laitue, tomate, oignons et sauce secrète maison dans un bun brioché grillé.",                       "prix": 80,  "tps": 18},
            {"nom": "BBQ Bacon Burger",         "desc": "Double steak, bacon croustillant, cheddar, oignons caramélisés, sauce BBQ fumée et cornichons dans bun grillé.",                           "prix": 100, "tps": 20},
            {"nom": "Crispy Chicken Burger",    "desc": "Filet de poulet pané crunchy, salade coleslaw maison, pickles et sauce ranch dans un bun sésame moelleux.",                                "prix": 88,  "tps": 18},
            {"nom": "Veggie Burger",            "desc": "Steak de pois chiches et légumes rôtis, avocat écrasé, tomate fraîche et sauce yaourt-herbes dans bun complet.",                          "prix": 78,  "tps": 18},
            {"nom": "Smash Burger double",      "desc": "Deux steaks smashés caramélisés, double cheddar fondu, oignons croustillants et sauce burger. Le best-seller.",                           "prix": 110, "tps": 15},
            {"nom": "Burger Zefran (signature)","desc": "Agneau haché aux épices marocaines, fromage raclette, chermoula mayo, tomate confit et oignons frits. Notre création.",                   "prix": 105, "tps": 20},
        ],
    },
    {
        "nom": "Pâtes & Risottos",
        "ordre": 11,
        "plats": [
            {"nom": "Spaghetti Carbonara",      "desc": "Spaghetti al dente, lardons fumés, œuf, pecorino et poivre noir concassé. Recette romaine traditionnelle, sans crème.",                   "prix": 78,  "tps": 18},
            {"nom": "Penne Bolognaise",         "desc": "Sauce bolognaise mijotée 3h avec bœuf, veau, tomates et vin rouge, sur penne rigate al dente. Gratinée au parmesan.",                     "prix": 80,  "tps": 20},
            {"nom": "Tagliatelles aux crevettes","desc": "Crevettes sautées à l'ail, bisque légère, tomates cerises et basilic sur tagliatelles fraîches maison.",                                 "prix": 95,  "tps": 22},
            {"nom": "Risotto aux champignons",  "desc": "Riz arborio crémeux, champignons des bois (shiitake, pleurotes), parmesan et truffe noire râpée. Raffiné.",                               "prix": 95,  "tps": 25},
            {"nom": "Lasagnes maison",          "desc": "Couches de pâtes fraîches, sauce bolognaise maison, béchamel crémeuse et parmesan. Gratinées au four.",                                    "prix": 88,  "tps": 25},
            {"nom": "Gnocchi à la sorrentina",  "desc": "Gnocchi de pommes de terre maison, sauce tomate fraîche, mozzarella filante et basilic. Fondant et généreux.",                            "prix": 82,  "tps": 20},
        ],
    },
    {
        "nom": "Sandwichs & Wraps",
        "ordre": 12,
        "plats": [
            {"nom": "Club Sandwich",            "desc": "Triple couche de poulet grillé, bacon, œuf dur, laitue, tomate et mayo dans pain de mie toasté. Servi avec frites.",                      "prix": 72,  "tps": 12},
            {"nom": "Wrap Poulet Grillé",       "desc": "Tortilla chaude, poulet mariné, crudités fraîches, fromage fondu et sauce chipotle. Léger et savoureux.",                                  "prix": 68,  "tps": 12},
            {"nom": "Panini Mozzarella",        "desc": "Pain ciabatta grillé, mozzarella fraîche, tomates séchées, roquette et pesto basilic. Chaud et croustillant.",                            "prix": 62,  "tps": 10},
            {"nom": "Wrap Végétarien",          "desc": "Hummus maison, falafel croustillant, légumes rôtis, tomates, concombre et sauce tahini dans tortilla complète.",                          "prix": 62,  "tps": 12},
            {"nom": "Croque Monsieur",          "desc": "Pain de mie, jambon blanc, béchamel et emmental fondu, gratiné au four jusqu'à dorure parfaite.",                                        "prix": 55,  "tps": 10},
        ],
    },
    {
        "nom": "Viandes & Volailles",
        "ordre": 13,
        "plats": [
            {"nom": "Entrecôte grillée",        "desc": "Entrecôte de bœuf 300g grillée selon votre cuisson, servie avec frites maison et sauce au choix (poivre/béarnaise).",                    "prix": 165, "tps": 25},
            {"nom": "Filet mignon de veau",     "desc": "Filet mignon de veau rosé, sauce crème morilles, purée de pommes de terre truffée et haricots verts fins.",                              "prix": 180, "tps": 30},
            {"nom": "Escalope de poulet",       "desc": "Escalope de poulet dorée au beurre, champignons de Paris, crème fraîche et persil. Accompagnée de riz pilaf.",                           "prix": 90,  "tps": 20},
            {"nom": "Rack d'agneau",            "desc": "Carré d'agneau en croûte de pistaches et herbes, jus réduit au romarin, gratin dauphinois et légumes de saison.",                        "prix": 195, "tps": 35},
            {"nom": "Confit de canard",         "desc": "Cuisse de canard confite 12h, peau croustillante, servie avec sarladaises à l'ail et confiture de figues.",                              "prix": 145, "tps": 30},
        ],
    },
    {
        "nom": "Salades Repas",
        "ordre": 14,
        "plats": [
            {"nom": "Salade César",             "desc": "Romaine croquante, croûtons dorés, copeaux de parmesan, poulet grillé et sauce César anchoïade maison.",                                  "prix": 72,  "tps": 10},
            {"nom": "Salade Niçoise",           "desc": "Thon, œufs durs, haricots verts, tomates, olives, anchois et vinaigrette moutarde sur lit de roquette.",                                 "prix": 75,  "tps": 10},
            {"nom": "Salade Grecque",           "desc": "Tomates, concombres, poivrons, olives Kalamata, feta AOP et origan sur lit de salade verte. Vinaigrette citron.",                        "prix": 68,  "tps": 8},
            {"nom": "Bowl Avocat-Quinoa",       "desc": "Quinoa, avocat, edamame, carottes, radis, maïs, graines de sésame et sauce soja-gingembre. Healthy et complet.",                        "prix": 82,  "tps": 10},
        ],
    },
]

MENU = [
    {
        "nom": "Entrées",
        "ordre": 1,
        "plats": [
            {"nom": "Zaalouk",                  "desc": "Caviar d'aubergines grillées, tomates, ail, cumin et huile d'olive. Servi tiède avec du pain marocain.",             "prix": 35,  "tps": 10},
            {"nom": "Salade marocaine",          "desc": "Tomates, concombres, poivrons, oignons, olives noires, coriandre fraîche et vinaigrette au citron confit.",        "prix": 35,  "tps": 8},
            {"nom": "Briouates au fromage",      "desc": "Feuilletés croustillants farcis de fromage fondu et herbes fraîches, frits à la poêle. Servis avec sauce tomate.",  "prix": 45,  "tps": 12},
            {"nom": "Harira",                    "desc": "Soupe traditionnelle marocaine aux tomates, lentilles, pois chiches, vermicelles et épices. Accompagnée de citron.", "prix": 30,  "tps": 5},
            {"nom": "Maakouda",                  "desc": "Galettes de pommes de terre épicées, frites dorées, accompagnées de chermoula et sauce pimentée maison.",            "prix": 40,  "tps": 15},
            {"nom": "Bessara",                   "desc": "Soupe épaisse de fèves sèches assaisonnée d'huile d'olive, ail, cumin et paprika. Spécialité du nord du Maroc.",    "prix": 28,  "tps": 8},
        ],
    },
    {
        "nom": "Tajines",
        "ordre": 2,
        "plats": [
            {"nom": "Tajine poulet citron-olives",     "desc": "Poulet fermier mijoté avec citrons confits, olives vertes, gingembre, safran et coriandre. Notre plat signature.",          "prix": 95,  "tps": 35},
            {"nom": "Tajine agneau pruneaux-amandes",  "desc": "Épaule d'agneau confite aux pruneaux caramélisés, amandes grillées, miel et cannelle. Un festin sucré-salé inoubliable.",   "prix": 125, "tps": 45},
            {"nom": "Tajine kefta-œufs",               "desc": "Boulettes de viande hachée épicées dans une sauce tomate relevée, surmonté d'œufs pochés et de persil frais.",             "prix": 85,  "tps": 30},
            {"nom": "Tajine légumes",                  "desc": "Assortiment de légumes de saison (carottes, courgettes, pommes de terre, navets) mijotés aux épices marocaines.",           "prix": 70,  "tps": 30},
            {"nom": "Tajine sardines",                 "desc": "Sardines fraîches farcies à la chermoula, cuites à l'étouffée avec tomates, poivrons et olives. Spécialité côtière.",      "prix": 80,  "tps": 35},
            {"nom": "Tajine veau aux petits pois",     "desc": "Morceaux de veau tendres mijotés avec petits pois frais, artichauts, citron et herbes aromatiques.",                       "prix": 105, "tps": 40},
        ],
    },
    {
        "nom": "Couscous",
        "ordre": 3,
        "plats": [
            {"nom": "Couscous royal",            "desc": "Semoule fine aux 7 légumes traditionnels, merguez, poulet, agneau et bouillon parfumé au ras el hanout. Festif et généreux.",  "prix": 135, "tps": 30},
            {"nom": "Couscous poulet",           "desc": "Semoule dorée avec poulet rôti, courgettes, navets, pois chiches et bouillon épicé. Copieux et réconfortant.",                "prix": 95,  "tps": 25},
            {"nom": "Couscous agneau",           "desc": "Épaule d'agneau confite, carottes, potiron, raisins secs et semoule parfumée au beurre et à la cannelle.",                    "prix": 115, "tps": 30},
            {"nom": "Couscous végétarien",       "desc": "Semoule complète aux légumes de saison rôtis, pois chiches, raisins secs et harissa maison. 100% végétal.",                   "prix": 80,  "tps": 25},
            {"nom": "Couscous tfaya",            "desc": "Semoule sucrée-salée avec oignons caramélisés aux raisins et épices, poulet confit et amandes grillées.",                     "prix": 105, "tps": 35},
        ],
    },
    {
        "nom": "Grillades",
        "ordre": 4,
        "plats": [
            {"nom": "Kefta au charbon",          "desc": "Brochettes de viande hachée épicée (bœuf-agneau) grillées au charbon de bois, servies avec pain, tomates et harissa.",         "prix": 85,  "tps": 20},
            {"nom": "Brochettes d'agneau",       "desc": "Cubes d'agneau marinés au cumin, paprika et herbes fraîches, grillés à la braise. Accompagnées de légumes grillés.",           "prix": 115, "tps": 20},
            {"nom": "Poulet grillé entier",      "desc": "Poulet fermier entier mariné 12h dans la chermoula (coriandre, ail, épices), grillé lentement au charbon de bois.",            "prix": 125, "tps": 35},
            {"nom": "Mixed grill assortiment",   "desc": "Sélection de kefta, brochettes d'agneau, côtelettes et poulet. Idéal pour 2 personnes. Servi avec 3 sauces maison.",           "prix": 180, "tps": 30},
            {"nom": "Côtelettes d'agneau",       "desc": "Côtelettes d'agneau marinées au romarin et ail, grillées à point. Servies avec légumes rôtis et sauce à la menthe.",          "prix": 135, "tps": 25},
            {"nom": "Merguez maison",            "desc": "Saucisses épicées de bœuf et agneau préparées maison, grillées sur braise. Servies avec semoule et harissa artisanale.",      "prix": 90,  "tps": 20},
        ],
    },
    {
        "nom": "Pastillas",
        "ordre": 5,
        "plats": [
            {"nom": "Pastilla au poulet",        "desc": "Feuilles de warqa croustillantes farcies de pigeon/poulet effiloché, amandes, cannelle et sucre glace. Un classique de Fès.",  "prix": 95,  "tps": 20},
            {"nom": "Pastilla aux fruits de mer","desc": "Feuilletés dorés farcis de crevettes, calamars et champignons dans une béchamel crémeuse aux épices douces.",                 "prix": 115, "tps": 25},
            {"nom": "Pastilla aux amandes",      "desc": "Version sucrée de la pastilla, farcies d'amandes grillées, miel, eau de fleur d'oranger et cannelle. Servie tiède.",         "prix": 75,  "tps": 18},
        ],
    },
    {
        "nom": "Desserts",
        "ordre": 6,
        "plats": [
            {"nom": "Cornes de gazelle",         "desc": "Croissants feuilletés farcis d'une pâte d'amandes parfumée à la fleur d'oranger et à la cannelle. Fondants et délicats.",    "prix": 30,  "tps": 5},
            {"nom": "Chebakia",                  "desc": "Gâteaux en fleur frits, trempés dans le miel chaud et parsemés de graines de sésame. Incontournable du Ramadan.",            "prix": 25,  "tps": 5},
            {"nom": "M'hanncha",                 "desc": "Serpent de pâte filo enroulé, farci d'amandes, miel et cannelle. Croquant dehors, fondant dedans. Pour 2-3 personnes.",      "prix": 55,  "tps": 8},
            {"nom": "Salade d'oranges",          "desc": "Oranges fraîches émincées, fleur d'oranger, cannelle, sucre glace et feuilles de menthe. Légère et parfumée.",              "prix": 30,  "tps": 5},
            {"nom": "Crème caramel orientale",   "desc": "Flan onctueux à la fleur d'oranger et eau de rose, caramel doré maison. Une touche marocaine sur un grand classique.",      "prix": 38,  "tps": 5},
            {"nom": "Kaab el ghazal",            "desc": "Biscuits sablés en forme de croissant, fourrés de pâte d'amandes et aromatisés à la cannelle. Tradition pâtissière de Fès.", "prix": 28,  "tps": 5},
        ],
    },
    {
        "nom": "Boissons",
        "ordre": 7,
        "plats": [
            {"nom": "Thé à la menthe",           "desc": "Thé gunpowder préparé à la façon traditionnelle marocaine, infusé avec de la menthe fraîche et du sucre. Servi en théière.", "prix": 20,  "tps": 5},
            {"nom": "Jus d'avocat",              "desc": "Avocat frais mixé avec lait, miel et eau de fleur d'oranger. Onctueux et nourrissant.",                                       "prix": 38,  "tps": 5},
            {"nom": "Jus d'orange frais",        "desc": "Oranges du Maroc pressées à la minute, sans sucre ajouté. Vitamines et fraîcheur garanties.",                                 "prix": 28,  "tps": 5},
            {"nom": "Limonade maison",           "desc": "Citrons frais, eau pétillante, menthe, sucre de canne et glaçons. Maison et rafraîchissante.",                                "prix": 30,  "tps": 5},
            {"nom": "Café marocain",             "desc": "Café noir corsé servi avec cardamome, accompagné de lait chaud si souhaité. La touche finale d'un repas parfait.",            "prix": 20,  "tps": 5},
            {"nom": "Eau minérale Sidi Ali",     "desc": "Eau minérale naturelle 50cl ou 1L. Source des montagnes de l'Atlas marocain.",                                                "prix": 15,  "tps": 2},
        ],
    },
]


class Command(BaseCommand):
    help = "Insère les catégories et plats du menu Zefran (sans doublons)"

    def handle(self, *args, **options):
        created_cats = 0
        created_plats = 0
        skipped = 0

        for cat_data in MENU + MENU_EXTRA:
            cat, cat_new = Categorie.objects.get_or_create(
                nom=cat_data["nom"],
                defaults={"ordre": cat_data["ordre"]},
            )
            if cat_new:
                created_cats += 1
                self.stdout.write(f"  [NEW] Categorie : {cat.nom}")
            else:
                self.stdout.write(f"  [OK]  Categorie : {cat.nom}")

            for p in cat_data["plats"]:
                plat, plat_new = Plat.objects.get_or_create(
                    nom=p["nom"],
                    defaults={
                        "description": p["desc"],
                        "prix": p["prix"],
                        "categorie": cat,
                        "temps_preparation": p["tps"],
                        "disponible": True,
                    },
                )
                if plat_new:
                    created_plats += 1
                    self.stdout.write(f"      + {plat.nom} ({plat.prix} DH)")
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nTermine : {created_cats} categorie(s), {created_plats} plat(s) crees, {skipped} ignores (deja existants)."
        ))
