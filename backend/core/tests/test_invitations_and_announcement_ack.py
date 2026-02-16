import pytest
from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import (
    School,
    SchoolYear,
    Group,
    User,
    Student,
    ParentStudent,
    VocalAssignment,
    SpecialistAssignment,
    Invitation,
    Announcement,
    AnnouncementRead,
)


def auth(client, user, school):
    token = str(RefreshToken.for_user(user).access_token)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}", HTTP_X_SCHOOL_ID=str(school.id))


@pytest.mark.django_db(transaction=True)
def test_invitation_accept_invalid_or_inactive_token():
    school = School.objects.create(name="S", slug="s", subdomain="s", active=True)
    director = User.objects.create_user(username="d@s.com", email="d@s.com", password="p", role=User.Roles.DIRECTOR, school=school)
    client = APIClient()
    auth(client, director, school)

    bad = client.post("/api/v1/invitations/00000000-0000-0000-0000-000000000000/accept/", {}, format="json")
    assert bad.status_code == 400

    expired = Invitation.objects.create(
        school=school,
        role=User.Roles.PADRE,
        expires_at=timezone.now() - timedelta(minutes=1),
        max_uses=1,
        created_by=director,
    )
    res = client.post(f"/api/v1/invitations/{expired.token}/accept/", {}, format="json")
    assert res.status_code == 400

    revoked = Invitation.objects.create(
        school=school,
        role=User.Roles.PADRE,
        expires_at=timezone.now() + timedelta(days=1),
        max_uses=1,
        created_by=director,
        revoked_at=timezone.now(),
    )
    res2 = client.post(f"/api/v1/invitations/{revoked.token}/accept/", {}, format="json")
    assert res2.status_code == 400


@pytest.mark.django_db(transaction=True)
def test_invitation_accept_increments_uses_and_respects_max_uses():
    school = School.objects.create(name="S2", slug="s2", subdomain="s2", active=True)
    director = User.objects.create_user(username="d2@s.com", email="d2@s.com", password="p", role=User.Roles.DIRECTOR, school=school)
    invitation = Invitation.objects.create(
        school=school,
        role=User.Roles.PADRE,
        expires_at=timezone.now() + timedelta(days=1),
        max_uses=1,
        created_by=director,
    )

    c1 = APIClient()
    u1 = User.objects.create_user(username="p1@s.com", email="p1@s.com", password="p", role=User.Roles.PADRE, school=school)
    auth(c1, u1, school)
    ok = c1.post(f"/api/v1/invitations/{invitation.token}/accept/", {}, format="json")
    assert ok.status_code == 200
    invitation.refresh_from_db()
    assert invitation.uses_count == 1

    c2 = APIClient()
    u2 = User.objects.create_user(username="p2@s.com", email="p2@s.com", password="p", role=User.Roles.PADRE, school=school)
    auth(c2, u2, school)
    denied = c2.post(f"/api/v1/invitations/{invitation.token}/accept/", {}, format="json")
    assert denied.status_code == 400


@pytest.mark.django_db(transaction=True)
def test_invitation_cross_tenant_forbidden_and_parent_vocal_teacher_associations():
    school1 = School.objects.create(name="A", slug="a", subdomain="a", active=True)
    school2 = School.objects.create(name="B", slug="b", subdomain="b", active=True)
    sy1 = SchoolYear.objects.create(school=school1, name="2025", start_date="2025-01-01", end_date="2025-12-31", is_current=True)
    group = Group.objects.create(school=school1, school_year=sy1, name="G1", grade_level=1)
    director = User.objects.create_user(username="d@a.com", email="d@a.com", password="p", role=User.Roles.DIRECTOR, school=school1)

    student = Student.objects.create(school=school1, first_name="A", last_name="B", grade_level=1, enrollment_code="ABC123")

    parent_inv = Invitation.objects.create(
        school=school1,
        role=User.Roles.PADRE,
        group=group,
        expires_at=timezone.now() + timedelta(days=1),
        max_uses=2,
        created_by=director,
        metadata={"enrollment_code": "ABC123", "relationship": "mother"},
    )
    vocal_inv = Invitation.objects.create(
        school=school1,
        role=User.Roles.VOCAL,
        group=group,
        expires_at=timezone.now() + timedelta(days=1),
        max_uses=1,
        created_by=director,
    )
    itinerant_inv = Invitation.objects.create(
        school=school1,
        role=User.Roles.MAESTRO_ITINERANTE,
        group=group,
        expires_at=timezone.now() + timedelta(days=1),
        max_uses=1,
        created_by=director,
        metadata={"subject": "Ingles"},
    )

    outsider = User.objects.create_user(username="x@b.com", email="x@b.com", password="p", role=User.Roles.PADRE, school=school2)
    cross = APIClient()
    auth(cross, outsider, school2)
    cross_res = cross.post(f"/api/v1/invitations/{parent_inv.token}/accept/", {}, format="json")
    assert cross_res.status_code in (400, 403)

    p = User.objects.create_user(username="p@a.com", email="p@a.com", password="p", role=User.Roles.PADRE, school=school1)
    c_parent = APIClient(); auth(c_parent, p, school1)
    assert c_parent.post(f"/api/v1/invitations/{parent_inv.token}/accept/", {}, format="json").status_code == 200
    assert ParentStudent.objects.filter(parent=p, student=student).exists()

    v = User.objects.create_user(username="v@a.com", email="v@a.com", password="p", role=User.Roles.VOCAL, school=school1)
    c_vocal = APIClient(); auth(c_vocal, v, school1)
    assert c_vocal.post(f"/api/v1/invitations/{vocal_inv.token}/accept/", {}, format="json").status_code == 200
    assert VocalAssignment.objects.filter(parent=v, group=group).exists()

    t = User.objects.create_user(username="t@a.com", email="t@a.com", password="p", role=User.Roles.MAESTRO_ITINERANTE, school=school1)
    c_teacher = APIClient(); auth(c_teacher, t, school1)
    assert c_teacher.post(f"/api/v1/invitations/{itinerant_inv.token}/accept/", {}, format="json").status_code == 200
    assert SpecialistAssignment.objects.filter(teacher=t, group=group, subject="Ingles").exists()


@pytest.mark.django_db(transaction=True)
def test_announcement_ack_permissions_and_stats_tenant_safe():
    school1 = School.objects.create(name="S1", slug="s1", subdomain="s1", active=True)
    school2 = School.objects.create(name="S2", slug="s22", subdomain="s22", active=True)
    sy = SchoolYear.objects.create(school=school1, name="2025", start_date="2025-01-01", end_date="2025-12-31", is_current=True)
    d1 = User.objects.create_user(username="d1@s.com", email="d1@s.com", password="p", role=User.Roles.DIRECTOR, school=school1)
    d2 = User.objects.create_user(username="d2@s.com", email="d2@s.com", password="p", role=User.Roles.DIRECTOR, school=school2)
    t1 = User.objects.create_user(username="t1@s.com", email="t1@s.com", password="p", role=User.Roles.MAESTRO_TITULAR, school=school1)
    t2 = User.objects.create_user(username="t2@s.com", email="t2@s.com", password="p", role=User.Roles.MAESTRO_TITULAR, school=school2)
    g1 = Group.objects.create(school=school1, school_year=sy, name="G1", grade_level=1, homeroom_teacher=t1)

    ann = Announcement.objects.create(school=school1, scope=Announcement.Scope.GRUPO, group=g1, teacher=t1, title="A", message="m", requires_ack=True)

    outsider = APIClient(); auth(outsider, t2, school2)
    blocked = outsider.post(f"/api/v1/announcements/{ann.id}/ack/", {}, format="json")
    assert blocked.status_code in (403, 404)

    c1 = APIClient(); auth(c1, t1, school1)
    ok = c1.post(f"/api/v1/announcements/{ann.id}/ack/", {}, format="json")
    assert ok.status_code == 200
    assert AnnouncementRead.objects.filter(announcement=ann, user=t1).exists()

    cdir2 = APIClient(); auth(cdir2, d2, school2)
    stats_other = cdir2.get(f"/api/v1/announcements/{ann.id}/ack-stats/")
    assert stats_other.status_code in (403, 404)

    cdir1 = APIClient(); auth(cdir1, d1, school1)
    stats = cdir1.get(f"/api/v1/announcements/{ann.id}/ack-stats/")
    assert stats.status_code == 200
    payload = stats.json()
    assert payload["announcement_id"] == ann.id
    assert payload["read"] == 1
