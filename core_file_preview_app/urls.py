""" Url router for the file preview app
"""

from django.urls import re_path

from core_file_preview_app.views.user.ajax import get_blob_preview

urlpatterns = [
    re_path(
        r"^get_blob_preview",
        get_blob_preview,
        name="core_file_preview_app_get_blob_preview",
    ),
]
