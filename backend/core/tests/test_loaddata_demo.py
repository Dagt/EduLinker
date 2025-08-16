import pytest
from django.core.management import call_command
from core.models import School, SchoolYear, User, Group, Event


@pytest.mark.django_db
def test_loaddata_demo_creates_basic_objects():
    call_command("loaddata_demo")
    assert School.objects.filter(name="Colegio Demo").exists()
    assert SchoolYear.objects.count() > 0
    assert User.objects.filter(email="director@demo.com").exists()
    assert Group.objects.exists()
    assert Event.objects.exists()
