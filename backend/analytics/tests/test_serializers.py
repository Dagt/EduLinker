from analytics.serializers import OverviewAnalyticsSerializer


def test_overview_serializer_structure():
    data = {
        "complaints_total": 0,
        "complaints_open": 0,
        "suggestions_total": 0,
        "complaints_by_group": [],
        "fundraising_by_group": [],
        "fundraising_by_event": [],
        "fundraising_total": 0,
        "surveys_participation": [],
        "surveys_participation_by_survey": [],
        "suggestions_by_status": [],
        "events_total": 0,
        "events_upcoming": 0,
        "events_cancelled": 0,
        "events_by_scope": [],
        "rsvp_by_group": [],
        "rsvp_attendance_rate_by_group": [],
    }

    serializer = OverviewAnalyticsSerializer(data)
    assert serializer.data == data
