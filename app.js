let table;
let role = '_';

$(document).ready(function () {

    /* =========================
       LOGIN
    ========================== */
    $('#loginBtn').click(function () {
        const u = $('#username').val().trim();
        const p = $('#password').val().trim();

        if (u === 'admin' && p === '123admin') role = 'Admin';
        else if (u === 'noc' && p === 'noc123') role = 'NOC';
        else return alert('Username / Password salah');

        localStorage.setItem('loginRole', role);

        $('#loginBox').hide();
        $('#dashboard').removeClass('d-none');
        $('#roleBadge').text(role);

        initTable();
    });

    /* =========================
       LOGOUT
    ========================== */
    $('#logoutBtn').click(function () {
        localStorage.removeItem('loginRole');
        location.reload();
    });

    /* =========================
       AUTO LOGIN (REFRESH)
    ========================== */
    const savedRole = localStorage.getItem('loginRole');
    if (savedRole) {
        role = savedRole;
        $('#loginBox').hide();
        $('#dashboard').removeClass('d-none');
        $('#roleBadge').text(role);
        initTable();
    }

    /* =========================
       BUKA MODAL TAMBAH
    ========================== */
    $('#addBtn').click(function () {
        $('#dataForm')[0].reset();
        $('#rowIndex').val('');
        $('#dataModal').modal('show');
    });

    /* =========================
       SIMPAN DATA (TAMBAH / EDIT)
    ========================== */
    $('#dataForm').submit(function (e) {
        e.preventDefault();

        const rowIndex = $('#rowIndex').val();

        const rowData = [
            '', // nomor otomatis
            $('#layanan').val(),
            $('#lokasi').val(),
            $('#no_layanan').val(),
            $('#nama').val(),
            $('#alamat').val(),
            actionBtn()
        ];

        if (rowIndex === '') {
            table.row.add(rowData).draw(false);
        } else {
            table.row(rowIndex).data(rowData).draw(false);
        }

        saveData();
        $('#dataModal').modal('hide');
        this.reset();
    });

    /* =========================
       EDIT DATA
    ========================== */
    $('#dataTable tbody').on('click', '.edit-btn', function () {
        const row = table.row($(this).closest('tr'));
        const data = row.data();

        $('#rowIndex').val(row.index());
        $('#layanan').val(data[1]);
        $('#lokasi').val(data[2]);
        $('#no_layanan').val(data[3]);
        $('#nama').val(data[4]);
        $('#alamat').val(data[5]);

        $('#dataModal').modal('show');
    });

    /* =========================
       HAPUS DATA
    ========================== */
    $('#dataTable tbody').on('click', '.delete-btn', function () {
        if (!confirm('Yakin ingin menghapus data ini?')) return;

        table.row($(this).closest('tr')).remove().draw(false);
        saveData();
    });

});

/* =========================
   INIT DATATABLE (FINAL)
========================= */
function initTable() {

    if ($.fn.DataTable.isDataTable('#dataTable')) return;

    table = $('#dataTable').DataTable({
        pageLength: 10,
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'print',
                title: 'DATA PELANGGAN',
                exportOptions: { columns: [0,1,2,3,4,5] }
            },
            {
                extend: 'excelHtml5',
                title: 'Data_Pelanggan',
                exportOptions: { columns: [0,1,2,3,4,5] }
            },
            {
                extend: 'pdfHtml5',
                title: 'DATA PELANGGAN',
                orientation: 'landscape',
                pageSize: 'A4',
                exportOptions: { columns: [0,1,2,3,4,5] },
                customize: function (doc) {
                    doc.defaultStyle.fontSize = 9;
                }
            }
        ],
        columnDefs: [
            { targets: 0, searchable: false, orderable: false }
        ],
        order: [[1, 'asc']]
    });

    /* =========================
       AUTO NUMBERING (PALING FIX)
    ========================== */
    table.on('order.dt search.dt draw.dt', function () {
        let i = 1;
        table.cells(null, 0, { search: 'applied', order: 'applied' })
            .every(function () {
                this.data(i++);
            });
    }).draw();

    loadData();
}

/* =========================
   BUTTON AKSI
========================= */
function actionBtn() {
    return `
        <button class="btn btn-sm btn-warning edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn">Hapus</button>
    `;
}

/* =========================
   LOCAL STORAGE (AMAN)
========================= */
function saveData() {
    let data = table.rows().data().toArray();
    data.forEach(row => row[0] = ''); // nomor jangan disimpan
    localStorage.setItem('cidData', JSON.stringify(data));
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('cidData'));
    if (data) table.rows.add(data).draw();
}
