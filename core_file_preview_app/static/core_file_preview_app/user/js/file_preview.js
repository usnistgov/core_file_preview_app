// TODO: we might consider saving multiple image size in DB in order to generate a preview for big files

/**
* constants
*/
const FILE_CATEGORIES = {
    image: "IMAGE",
    text: "TEXT"
}
const DATA_TYPE = [
    {
        mime_type: "image/jpeg",
        base_type: FILE_CATEGORIES.image
    },
    {
        mime_type: "image/jpg",
        base_type: FILE_CATEGORIES.image
    },
    {
        mime_type: "image/png",
        base_type: FILE_CATEGORIES.image
    },
    {
        mime_type: "text/plain",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "text/csv",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "application/xml",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "text/xml",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "application/xslt+xml",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "text/html",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "application/json",
        base_type: FILE_CATEGORIES.text
    },
    {
        mime_type: "none",
        base_type: FILE_CATEGORIES.text
    },
]

/**
* display the modal preview
*/
var displayPreview = function(event) {
    populateModal("#fileImageDisplayArea", "Loading...", true);

    $.ajax({
        url: filePreviewUrl,
        data: {
            url_blob: event.data.url,
        },
        contentType: 'application/json',
        success: function(data, textStatus, xhr) {
            var typeSupportedResult = isTypeSupported(data.mime_type),
                blob = b64toBlob(data.content, data.mime_type)
            if(typeSupportedResult.is_supported) {
                var content;
                if(typeSupportedResult.type == FILE_CATEGORIES.image) {
                    var imageUrl = URL.createObjectURL(blob);
                    var img = new Image();
                    img.addEventListener('load', () => URL.revokeObjectURL(imageUrl));
                    img.src = imageUrl;
                    content = img;
                    populateModal("#fileImageDisplayArea", content, true);
                } else {
                    var fileReader = new FileReader();
                    fileReader.readAsText(blob);
                    fileReader.onloadend = function(e) {
                        populateModal("#fileTextDisplayArea", fileReader.result);
                    };
                }
            } else {
                populateModal("#errorArea", "File format is not supported");
            }
            $("#btn-file-preview-download").attr("href", URL.createObjectURL(blob));
            $("#btn-file-preview-download").attr("download", data.filename);
            $("#btn-file-preview-download").show();
        },
        error: function(data) {
            var message;
            if(data.status == 404){
                message = "The requested file was not found."
            } else if (data.status == 403){
                message = "You don't have enough right to consult this file."
            } else {
                message = "An error occurred while displaying the file."
            }
            populateModal("#errorArea", message);
        }
    });
    $("#file-preview-modal").modal("show");
}

/**
* is the type supported?
* return a structure { bool, type }
*/
var isTypeSupported = function(content_type) {
    var is_supported = false;
    var type_supported = false;
    DATA_TYPE.forEach(function(element) {
        if(content_type.indexOf(element.mime_type) > -1) {
            is_supported = true;
            type_supported = element.base_type;
        }
    });

    return {
        is_supported: is_supported,
        type: type_supported,
        mime_type: content_type
    };
}

/**
* clear the preview
*/
var clearModal = function() {
    // empty content
    $("#fileImageDisplayArea").html("");
    $("#fileTextDisplayArea").html("");
    $("#errorArea").html("");
    // hide areas
    $("#fileImageDisplayArea").hide();
    $("#fileTextDisplayArea").hide();
    $("#errorArea").hide();
    // hide download button
    $("#btn-file-preview-download").hide();
}

/**
* populate modal
*/
var populateModal = function(panel, content, as_html) {
    clearModal();
    if(as_html) {
        $(panel).html(content);
    } else {
        $(panel).text(content);
    }
    $(panel).show();
}

/**
* detect preview links
*/
var detectPreview = function() {
    // detect blob when passing over a text (of a displayed data)
    $(".blob-link").mouseover(function() {
        $(this).css('cursor', 'pointer');
        $(this).off('click', displayPreview).on("click", {url: $(this).attr("data-blob-url")}, displayPreview);
    });
}

/**
* build blob from base 64
* https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript?fbclid=IwAR2_7PWkfAv0NcBlLChT7F1ZmZyv6KYTuXKvNlBgpIzT9fFUOV5kGC8mRPA
*/
var b64toBlob = function(b64Data, contentType='', sliceSize=512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

/**
* wait the elements to be displayed, then bind them
*/
$(document).ready(function() {
    setInterval(function() {
        // need to check periodically if new blobs are displayed
        detectPreview();
    }, 500);
});
