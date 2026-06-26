from django.core.management.base import BaseCommand
from restaurant.models import Categorie, Plat


class Command(BaseCommand):
    help = "Fusionne les catégories en doublon et reclasse les plats mal placés"

    def handle(self, *args, **options):
        # 1. Fusionner Tagines (pk=16) -> Tajines (pk=6)
        try:
            tajines = Categorie.objects.get(pk=6)   # Tajines (gardée)
            tagines = Categorie.objects.get(pk=16)  # Tagines (doublon)

            noms_existants = set(tajines.plats.values_list('nom', flat=True))
            deplacés = 0
            supprimés = 0

            for plat in tagines.plats.all():
                # Si un plat du même nom existe déjà dans Tajines -> supprimer le doublon
                if plat.nom in noms_existants:
                    self.stdout.write(f"  [supprimé doublon] {plat.nom}")
                    plat.delete()
                    supprimés += 1
                else:
                    plat.categorie = tajines
                    plat.save()
                    self.stdout.write(f"  [deplace] {plat.nom} -> {tajines.nom}")
                    deplacés += 1

            tagines.delete()
            self.stdout.write(self.style.SUCCESS(
                f"\nOK 'Tagines' supprimée : {deplacés} plat(s) déplacé(s), {supprimés} doublon(s) supprimé(s)"
            ))
        except Categorie.DoesNotExist:
            self.stdout.write("  Catégories Tajines/Tagines introuvables, ignoré.")

        # 2. Nettoyer "Plats chauds" (pk=2) : reclasser vers la bonne catégorie
        try:
            plats_chauds = Categorie.objects.get(pk=2)
            couscous_cat = Categorie.objects.get(pk=7)

            noms_tajines = set(Categorie.objects.get(pk=6).plats.values_list('nom', flat=True))
            noms_couscous = set(couscous_cat.plats.values_list('nom', flat=True))

            for plat in plats_chauds.plats.all():
                nom_lower = plat.nom.lower()

                if 'couscous' in nom_lower:
                    if plat.nom in noms_couscous:
                        self.stdout.write(f"  [supprimé doublon] {plat.nom}")
                        plat.delete()
                    else:
                        plat.categorie = couscous_cat
                        plat.save()
                        self.stdout.write(f"  [déplacé] {plat.nom} -> Couscous")
                elif 'tajine' in nom_lower or 'tagine' in nom_lower:
                    if plat.nom in noms_tajines:
                        self.stdout.write(f"  [supprimé doublon] {plat.nom}")
                        plat.delete()
                    else:
                        tajines = Categorie.objects.get(pk=6)
                        plat.categorie = tajines
                        plat.save()
                        self.stdout.write(f"  [déplacé] {plat.nom} -> Tajines")
                else:
                    self.stdout.write(f"  [gardé tel quel] {plat.nom}")

            # Supprimer "Plats chauds" si vide
            if plats_chauds.plats.count() == 0:
                plats_chauds.delete()
                self.stdout.write(self.style.SUCCESS("OK 'Plats chauds' supprimée (vide)"))
            else:
                self.stdout.write(f"  'Plats chauds' gardée ({plats_chauds.plats.count()} plat(s) restant(s))")

        except Categorie.DoesNotExist:
            self.stdout.write("  Catégorie 'Plats chauds' introuvable, ignoré.")

        # 3. Résumé final
        self.stdout.write("\n--- État final ---")
        for cat in Categorie.objects.all():
            self.stdout.write(f"  [{cat.pk}] {cat.nom} — {cat.plats.count()} plats")
