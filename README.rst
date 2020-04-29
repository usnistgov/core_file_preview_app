=====================
Core File Preview App
=====================

File preview functionalities for the curator core project.

Quickstart
==========

1. Add "core_file_preview_app" to your INSTALLED_APPS setting
-------------------------------------------------------------

.. code:: python

    INSTALLED_APPS = [
        ...
        'core_file_preview_app',
    ]

2. Include the core_file_preview_app URLconf in your project urls.py like this
------------------------------------------------------------------------------

.. code:: python

    re_path(r'^file-preview/', include("core_file_preview_app.urls")),

