import events.urls as urls


def test_events_urlpatterns_defined():
    assert isinstance(urls.urlpatterns, list)
