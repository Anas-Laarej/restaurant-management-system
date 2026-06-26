from django.core.management.base import BaseCommand
from restaurant.models import Plat

# Local images (generated AI photos)
LOCAL = "/images/{}"

# Unsplash fallback for dishes without a local photo
UNSPLASH = "https://images.unsplash.com/photo-{}?w=600&h=400&fit=crop"

IMAGES = {
    # ── Entrées ────────────────────────────────────────────────────────────
    "Zaalouk":                       LOCAL.format("zaalouk.png"),
    "Salade marocaine":              LOCAL.format("salade-marocaine.png"),
    "Briouates au fromage":          LOCAL.format("briouates.png"),
    "Harira":                        "https://images.unsplash.com/photo-D0FiJZNj2gg?w=600&h=400&fit=crop",
    "Maakouda":                      LOCAL.format("maakouda.png"),
    "Bessara":                       LOCAL.format("bessara.png"),

    # ── Tajines ────────────────────────────────────────────────────────────
    "Tajine poulet citron-olives":    LOCAL.format("tajine-poulet.png"),
    "Tajine agneau pruneaux-amandes": LOCAL.format("tajine-agneau.png"),
    "Tajine kefta-œufs":              LOCAL.format("tajine-kefta.png"),
    "Tajine légumes":                 LOCAL.format("tajine-legumes.png"),
    "Tajine sardines":                LOCAL.format("tajine-sardines.png"),
    "Tajine veau aux petits pois":    LOCAL.format("tajine-veau.png"),

    # ── Couscous ───────────────────────────────────────────────────────────
    "Couscous royal":       LOCAL.format("couscous-royal.png"),
    "Couscous poulet":      LOCAL.format("couscous-poulet.png"),
    "Couscous agneau":      LOCAL.format("couscous-agneau.png"),
    "Couscous végétarien":  LOCAL.format("couscous-vegetarien.png"),
    "Couscous tfaya":       LOCAL.format("couscous-tfaya.png"),

    # ── Grillades ──────────────────────────────────────────────────────────
    "Kefta au charbon":        LOCAL.format("kefta.png"),
    "Brochettes d'agneau":     LOCAL.format("brochettes-agneau.png"),
    "Poulet grillé entier":    LOCAL.format("poulet-grille.png"),
    "Mixed grill assortiment": LOCAL.format("mixed-grill.png"),
    "Côtelettes d'agneau":     LOCAL.format("cotelettes-agneau.png"),
    "Merguez maison":          LOCAL.format("merguez.png"),

    # ── Pastillas ──────────────────────────────────────────────────────────
    "Pastilla au poulet":         LOCAL.format("pastilla-poulet.jpg"),
    "Pastilla aux fruits de mer": UNSPLASH.format("1579584425555-c3ce17fd4351"),
    "Pastilla aux amandes":       UNSPLASH.format("1567941723610-db0bcb4cca67"),

    # ── Desserts ───────────────────────────────────────────────────────────
    "Cornes de gazelle":       UNSPLASH.format("1583338917451-face2751d8d5"),
    "Chebakia":                UNSPLASH.format("1543773495-2cd9248a5bda"),
    "M'hanncha":               LOCAL.format("mhancha.png"),
    "Salade d'oranges":        UNSPLASH.format("1619241638225-14d56e47ae64"),
    "Crème caramel orientale": LOCAL.format("creme-caramel.png"),
    "Kaab el ghazal":          LOCAL.format("kaab-el-ghazal.png"),

    # ── Boissons ───────────────────────────────────────────────────────────
    "Thé à la menthe":       LOCAL.format("the-menthe.png"),
    "Jus d'avocat":          LOCAL.format("jus-avocat.png"),
    "Jus d'orange frais":    LOCAL.format("jus-orange.png"),
    "Limonade maison":       LOCAL.format("limonade.png"),
    "Café marocain":         LOCAL.format("cafe-marocain.png"),
    "Eau minérale Sidi Ali": UNSPLASH.format("1509785307050-d4066910ec1e"),

    # ── Pizzas ─────────────────────────────────────────────────────────────
    "Pizza Margherita":   LOCAL.format("pizza-margherita.png"),
    "Pizza 4 fromages":   LOCAL.format("pizza-4-fromages.png"),
    "Pizza Pepperoni":    UNSPLASH.format("1571997478779-2adcbbe9ab2f"),
    "Pizza Végétarienne": UNSPLASH.format("1598023696416-0193a0bcd302"),
    "Pizza Poulet BBQ":   UNSPLASH.format("1579751626657-72bc17010498"),
    "Pizza Royale":       UNSPLASH.format("1600028068383-ea11a7a101f3"),
    "Calzone":            UNSPLASH.format("1574071318508-1cdbab80d002"),

    # ── Sushis & Japonais ──────────────────────────────────────────────────
    "California Roll (8 pcs)":  UNSPLASH.format("1579584425555-c3ce17fd4351"),
    "Salmon Roll (8 pcs)":      UNSPLASH.format("1615361200141-f45040f367be"),
    "Dragon Roll (8 pcs)":      UNSPLASH.format("1579871494447-9811cf80d66c"),
    "Sashimi saumon (12 pcs)":  UNSPLASH.format("1611143669185-af224c5e3252"),
    "Plateau Mix (24 pcs)":     UNSPLASH.format("1617196034796-73dfa7b1fd56"),
    "Ramen poulet":             UNSPLASH.format("1612929633738-8fe44f7ec841"),
    "Gyozas (6 pcs)":           UNSPLASH.format("1615361200098-9e630ec29b4e"),

    # ── Burgers ────────────────────────────────────────────────────────────
    "Classic Burger":            UNSPLASH.format("1572802419224-296b0aeee0d9"),
    "BBQ Bacon Burger":          UNSPLASH.format("1550547660-d9450f859349"),
    "Crispy Chicken Burger":     UNSPLASH.format("1571091718767-18b5b1457add"),
    "Veggie Burger":             UNSPLASH.format("1530554764233-e79e16c91d08"),
    "Smash Burger double":       UNSPLASH.format("1561758033-d89a9ad46330"),
    "Burger Zefran (signature)": UNSPLASH.format("1551782450-a2132b4ba21d"),

    # ── Pâtes & Risottos ───────────────────────────────────────────────────
    "Spaghetti Carbonara":        UNSPLASH.format("1633337474564-1d9478ca4e2e"),
    "Penne Bolognaise":           UNSPLASH.format("1627207644206-a2040d60ecad"),
    "Tagliatelles aux crevettes": UNSPLASH.format("1588013273468-315fd88ea34c"),
    "Risotto aux champignons":    UNSPLASH.format("1546549032-9571cd6b27df"),
    "Lasagnes maison":            UNSPLASH.format("1662197480393-2a82030b7b83"),
    "Gnocchi à la sorrentina":    UNSPLASH.format("1608756687911-aa1599ab3bd9"),

    # ── Sandwichs & Wraps ──────────────────────────────────────────────────
    "Club Sandwich":      UNSPLASH.format("1646530208887-8a791bff4701"),
    "Wrap Poulet Grillé": UNSPLASH.format("1585238342107-49a3cdace47f"),
    "Panini Mozzarella":  UNSPLASH.format("1671572579845-52270341950f"),
    "Wrap Végétarien":    UNSPLASH.format("1671572580025-0280545b48c8"),
    "Croque Monsieur":    UNSPLASH.format("1665469222949-3de88d37ee5a"),

    # ── Viandes & Volailles ────────────────────────────────────────────────
    "Entrecôte grillée":   UNSPLASH.format("1723893905879-0e309c2a8e06"),
    "Filet mignon de veau":UNSPLASH.format("1546964124-0cce460f38ef"),
    "Escalope de poulet":  UNSPLASH.format("1638439430466-b2bb7fdc1d67"),
    "Rack d'agneau":       UNSPLASH.format("1692106914421-e04e1066bd62"),
    "Confit de canard":    UNSPLASH.format("1615557960916-5f4791effe9d"),

    # ── Salades Repas ──────────────────────────────────────────────────────
    "Salade César":      UNSPLASH.format("1700089483464-4f76cc3d360b"),
    "Salade Niçoise":    UNSPLASH.format("1607532941433-304659e8198a"),
    "Salade Grecque":    UNSPLASH.format("1546793665-c74683f339c1"),
    "Bowl Avocat-Quinoa":UNSPLASH.format("1600335895229-6e75511892c8"),
}


class Command(BaseCommand):
    help = "Assign local AI photos + Unsplash fallbacks to every dish"

    def handle(self, *args, **options):
        updated = 0
        not_found = []

        for nom, url in IMAGES.items():
            count = Plat.objects.filter(nom=nom).update(image_url=url)
            if count:
                updated += count
                src = "LOCAL" if url.startswith("/images/") else "UNSPLASH"
                self.stdout.write(f"  [{src}] {nom}")
            else:
                not_found.append(nom)

        if not_found:
            self.stdout.write("\n  [MISSING] Ces plats n'ont pas ete trouves :")
            for n in not_found:
                self.stdout.write(f"    - {n}")

        self.stdout.write(self.style.SUCCESS(
            f"\nTermine : {updated} plat(s) mis a jour."
        ))
