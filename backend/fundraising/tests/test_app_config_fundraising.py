from django.apps import apps


def test_app_config():
    assert apps.get_app_config("fundraising").name == "fundraising"
