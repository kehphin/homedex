from celery import shared_task


@shared_task
def hello_world():
    print("Hello World")
    return "Hello World executed"
