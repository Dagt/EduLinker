import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import School, SchoolYear, User, Group
from fundraising.models import FundraisingEvent, FundraisingGroupLedger, ExpenseEvidence


@pytest.mark.django_db
def test_fundraising_export_csv_pdf():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    sy = SchoolYear.objects.create(
        school=school,
        name="2025-2026",
        start_date="2025-08-01",
        end_date="2026-07-01",
        is_current=True,
    )
    user = User.objects.create_user(
        username="d@x.com",
        email="d@x.com",
        password="p",
        role="DIRECTOR",
        school=school,
    )
    group = Group.objects.create(
        school=school,
        school_year=sy,
        name="5A",
        grade_level=5,
        homeroom_teacher=user,
    )
    event = FundraisingEvent.objects.create(
        school=school,
        school_year=sy,
        name="Kermes",
        date="2025-10-10",
    )
    FundraisingGroupLedger.objects.create(
        event=event,
        group=group,
        amount_collected="100.00",
        created_by=user,
    )
    ExpenseEvidence.objects.create(
        ledger=None,
        group=group,
        uploader=user,
        file_url="http://example.com/file",
        amount="20.00",
        concept="Compra",
    )

    client = APIClient()
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id)
    )

    res = client.get(f"/api/v1/fundraising-events/{event.id}/export/?format=csv")
    assert res.status_code == 200
    assert res["Content-Type"] == "text/csv"

    res = client.get(f"/api/v1/fundraising-events/{event.id}/export/?format=pdf")
    assert res.status_code == 200
    assert res["Content-Type"] == "application/pdf"
