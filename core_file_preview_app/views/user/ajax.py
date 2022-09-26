""" Ajax User File preview
"""
import json
import logging

from django.http.response import HttpResponse, HttpResponseServerError
from django.utils.html import escape
from rest_framework import status

from core_main_app.utils.blob_downloader import BlobDownloader
from core_main_app.utils.file import (
    get_filename_from_response,
    get_base_64_content_from_response,
)

logger = logging.getLogger(__name__)


def get_blob_preview(request):
    """Get the blob preview

    Parameters:

        {
            "url_blob": url
        }

    Args:

        request: HTTP request

    Returns:

        - code: 200
          content: HttpResponse
        - code: 400
          content: Bad Request / unknown endpoit
        - code: 401
          content: Unauthorized
        - code: 500
          content: Internal server error
    """
    try:
        url = request.GET.get("url_blob", None)
        if url is not None:
            # download the blob
            response = BlobDownloader(
                url, request.session.session_key
            ).get_blob_response()
            # manage the response
            if response is not None:
                if response.status_code == status.HTTP_200_OK:
                    # build content
                    content = {
                        "content": get_base_64_content_from_response(response),
                        "mime_type": response.headers["Content-type"],
                        "filename": get_filename_from_response(response),
                    }
                    # we re-build the response from the response received
                    return HttpResponse(
                        json.dumps(content), "application/json"
                    )

                logger.error(
                    "get_blob_preview: Error while getting the blob: %s status code: %s",
                    json.loads(response.text)["message"],
                    response.status_code,
                )
                content_message = (
                    "Something went wrong while getting the file."
                )
            else:
                # at this point there is no known endpoint in our system
                content_message = "The endpoint is unknown."
        else:
            # handle missing parameters
            content_message = "Url blob not provided."
        # FIXME: the content_message is not pass to the AJAX error callback
        return HttpResponse(
            escape(content_message), status=response.status_code
        )
    except Exception as exception:
        # if something went wrong, return an internal server error
        content = {"message": escape(str(exception))}
        return HttpResponseServerError(content)
