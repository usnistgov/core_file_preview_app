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
        mime_type: "application/xml",
        base_type: FILE_CATEGORIES.text
    },
]

/**
* display the modal preview
*/
var displayPreview = function(event) {
    clearModal();
    populateModal("#fileImageDisplayArea", "Loading...", true);
    $.ajax({
        url: event.data.url,
        xhrFields : {
            responseType : 'blob'
        },
        dataType: 'binary',
        success: function(data, textStatus , xhr) {
            clearModal();
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
        error: function(err) {
            populateModal("#errorArea", err);
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
    if(as_html) {
        $(panel).html(content);
    } else {
        $(panel).text(content);
    }
    $(panel).show();
}


/**
* wait for an element to be present in the page
* for element that are display asynchronously
*/
var waitForElementReady = function(selector, callback) {
  if (jQuery(selector).length) {
    callback();
  } else {
    setTimeout(function() {
      waitForElementReady(selector, callback);
    }, 100);
  }
};

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
    waitForElementReady(".blob-link", function() {
        detectPreview();
    });
});