from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0009_user_ics_token"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="preferred_language",
            field=models.CharField(default="es", max_length=10),
        ),
    ]
