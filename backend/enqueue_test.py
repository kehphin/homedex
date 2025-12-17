#!/usr/bin/env python
"""
Quick script to enqueue a test task
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from owner.test_tasks import hello_world

task = hello_world.delay()
print(f'Task ID: {task.id}')
print(f'Task Status: {task.status}')
