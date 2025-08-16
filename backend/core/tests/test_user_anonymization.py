import pytest
from core.models import School, User
from audit.models import AuditLog


@pytest.mark.django_db(transaction=True)
def test_user_anonymization():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    user = User.objects.create_user(
        username="u@x.com",
        email="u@x.com",
        password="p",
        role="PADRE",
        school=school,
        first_name="John",
        last_name="Doe",
        phone="123456",
    )

    user.delete()
    user.refresh_from_db()

    assert user.first_name == ""
    assert user.last_name == ""
    assert user.email.startswith("deleted-")
    assert user.email.endswith("@example.com")
    assert user.phone == ""
    assert not user.is_active

    log = AuditLog.objects.filter(
        action="anonymize", entity_type="user", entity_id=user.id
    ).first()
    assert log is not None
