$(document).ready(function() {
    $(".editPriceTmplWrapper").on('click', function() {


        $(".editPriceTmpl").addClass("d-none");
        $(".edit-inp").removeClass("d-none");
        $("#editPrice").hide()
    });


    $("#editDescBtn").on('click', function () {

        $('#editTmpl').toggleClass('d-none');
        $('#viewTmpl').toggleClass('d-none');
        $("#applyDescBtn").toggleClass('d-none');
        $("#applyDiscountBtn").toggleClass('d-none');

        $('.editDiscount').toggleClass('d-none');
        $('.viewDiscount').toggleClass('d-none');

    });
});