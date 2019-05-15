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
        mime_type: "application/xslt+xml",
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
        xhrFields : {
            responseType : 'blob'
        },
        dataType: 'binary',
        success: function(data, textStatus , xhr) {
            typeSupportedResult = isTypeSupported(data.type);
            if(typeSupportedResult.is_supported){
                var content;
                if(typeSupportedResult.type == FILE_CATEGORIES.image) {
                    var imageUrl = URL.createObjectURL(data);
                    var img = new Image();
                    img.addEventListener('load', () => URL.revokeObjectURL(imageUrl));
                    img.src = imageUrl;
                    content = img;
                    populateModal("#fileImageDisplayArea", content, true);
                } else {
                    var fileReader = new FileReader();
                    fileReader.readAsText(data);
                    fileReader.onloadend = function(e) {
                        populateModal("#fileTextDisplayArea", fileReader.result);
                    };
                }
            } else {
                populateModal("#errorArea", "File format is not supported");
            }
        },
        error: function(jqXHR, status, error) {
            if(error) {
                populateModal("#errorArea", error);
            } else {
                populateModal("#errorArea", "An error occured while displaying the blob");
            }
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
    return { is_supported: is_supported, type: type_supported };
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
* wait the elements to be displayed, then bind them
*/
$(document).ready(function() {
    setInterval(function() {
        // need to check periodically if new blobs are displayed
        detectPreview();
    }, 500);
});
