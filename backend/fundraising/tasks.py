from celery import shared_task

from core.tasks import send_fundraising_weekly_summary


@shared_task
def weekly_fundraising_summary():
    return send_fundraising_weekly_summary()

