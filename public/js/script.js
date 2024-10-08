$(document).ready(function () {
    $('#example').DataTable({
        language: {
            paginate: {
                previous: "<<", // Previous button text
                next: ">>"      // Next button text
            }
        },
        "initComplete": function () {
            var pagination = this.api().table().container().find('.dataTables_paginate');

            // Make all page numbers look like links
            pagination.find('.paginate_button').each(function () {
                $(this).removeClass('paginate_button');
                $(this).addClass('link-button');
                $(this).css({
                    'padding': '0',
                    'margin': '0 5px',
                    'border': 'none',
                    'background-color': 'transparent',
                    'color': '#007bff',
                    'text-decoration': 'underline',
                    'cursor': 'pointer'
                });
                $(this).html($(this).text());
            });

            // Customize previous and next buttons
            pagination.find('.link-button[data-dt-idx="0"]').html('<<');
            pagination.find('.link-button[data-dt-idx="1"]').html('>>');
        }
    });
});


toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000", // 5 seconds
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

function openEditModal(id, name, description, price, stock, category) {
    $('#productId').val(id);
    $('#productName').val(name);
    $('#productDescription').val(description);
    $('#productPrice').val(price);
    $('#productStock').val(stock);
    $('#productCategory').val(category);
    $('#editModal').removeClass('hidden');
}

function closeEditModal() {
    $('#editModal').addClass('hidden');
}