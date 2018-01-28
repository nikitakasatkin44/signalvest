$(document).ready(function() {
    $("#adminBtn").on('click', function() {
        if (localStorage.getItem("editMode") === "true") {
            localStorage.setItem("editMode", false);
            $(this).removeClass("active");
            hideAdminElements();
            console.log("editMode is set to: " +  false);

        } else if (localStorage.getItem("editMode") === "false") {
            localStorage.setItem("editMode", true);
            $(this).addClass("active");
            showAdminElements();
            console.log("editMode is set to: " +  true);
        }

    });
});

function hideAdminElements() {
    const elements = document.getElementsByClassName("edit-price");

    for (i = 0; i < elements.length; i++) {
        elements[i].className = elements[i].className.replace(" d-none", "");
    }
}

function showAdminElements() {
    const elements = document.getElementsByClassName("edit-price");

    for (i = 0; i < elements.length; i++) {
        elements[i].className += " d-none";
    }
}
