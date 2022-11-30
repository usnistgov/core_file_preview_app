""" Tests Settings
"""

SECRET_KEY = "fake-key"

INSTALLED_APPS = [
    # Django apps
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sites",
    # Local app
    "tests",
]
MONGODB_INDEXING = False
MONGODB_ASYNC_SAVE = False
