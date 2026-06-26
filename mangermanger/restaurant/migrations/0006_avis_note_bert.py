from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('restaurant', '0005_avis_sentiment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='avis',
            name='note',
            field=models.IntegerField(
                choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)],
                null=True,
                blank=True,
            ),
        ),
    ]
