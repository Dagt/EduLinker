from edulinker.celery import app as celery_app


def test_fundraising_summary_task_scheduled():
    schedule = celery_app.conf.beat_schedule
    task = schedule.get("fundraising-weekly-summary")
    assert task is not None
    assert task["task"] == "core.tasks.send_fundraising_weekly_summary"

