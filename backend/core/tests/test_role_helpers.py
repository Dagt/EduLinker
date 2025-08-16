from types import SimpleNamespace

from core.permissions import (
    is_director,
    is_maestro_itinerante,
    is_maestro_titular,
    is_padre,
    is_vocal,
)


def make_user(role: str):
    return SimpleNamespace(role=role)


def test_role_predicates():
    assert is_director(make_user("DIRECTOR"))
    assert is_maestro_titular(make_user("MAESTRO_TITULAR"))
    assert is_maestro_itinerante(make_user("MAESTRO_ITINERANTE"))
    assert is_vocal(make_user("VOCAL"))
    assert is_padre(make_user("PADRE"))
    assert not is_director(make_user("PADRE"))
