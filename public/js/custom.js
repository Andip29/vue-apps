/* ================================
 *  Porto SPA Helpers (custom.js)
 * ================================ */
(function () {
  'use strict';

  // Pastikan jQuery ada
  if (!window.jQuery) return;
  var $ = window.jQuery;

  // Namespace global Porto (tanpa menimpa)
  window.Porto = window.Porto || {};

  /* --------------------------------
   * 1) Sidebar: toggle submenu
   * -------------------------------- */
  function bindSidebarToggles() {
    // Lepas handler lama (namespace .porto), lalu pasang lagi
    $(document)
      .off('click.porto', '.nav-parent > a.nav-link')
      .on('click.porto', '.nav-parent > a.nav-link', function (e) {
        e.preventDefault();
        $(this).closest('.nav-parent').toggleClass('nav-expanded');
      });
  }

  /* --------------------------------
   * 2) Re-init komponen UI umum
   *    (tooltip, popover, multiselect, datepicker, select2)
   * -------------------------------- */
  function initPageUI(ctx) {
    var root = ctx || document;

    // Bootstrap Tooltips / Popovers
    if (window.bootstrap) {
      root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
        if (!bootstrap.Tooltip.getInstance(el)) new bootstrap.Tooltip(el);
      });
      root.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
        if (!bootstrap.Popover.getInstance(el)) new bootstrap.Popover(el);
      });
    }

    // Bootstrap Multiselect
    if ($.fn.multiselect) {
      $(root)
        .find('[data-plugin-multiselect], select[data-toggle="multiselect"], select.multiselect, select[multiple].multiselect')
        .each(function () {
          var $el = $(this);
          if ($el.data('multiselect') || $el.data('bs.multiselect')) return; // sudah init
          var opts = $el.data('plugin-options') || {};
          try { $el.multiselect(opts); } catch (_) {}
        });
    }

    // Bootstrap Datepicker
    if ($.fn.datepicker) {
      $(root)
        .find('[data-plugin-datepicker], .js-datepicker')
        .each(function () {
          var $el = $(this);
          if ($el.data('datepicker')) return; // sudah init
          var opts = $el.data('plugin-options') || {};
          try { $el.datepicker(opts); } catch (_) {}
        });
    }

    // Select2
    if ($.fn.select2) {
      $(root)
        .find('[data-plugin-selectTwo], .js-select2')
        .each(function () {
          var $el = $(this);
          if ($el.hasClass('select2-hidden-accessible')) return; // sudah init
          var opts = $el.data('plugin-options') || {};
          try { $el.select2(opts); } catch (_) {}
        });
    }
  }

  /* --------------------------------
   * 3) DataTables init (class .datatable)
   *    + Buttons (jika disediakan vendornya)
   * -------------------------------- */
  function initTables(ctx) {
    var root = ctx || document;
    if (!$.fn.dataTable) return;

    $(root).find('table.datatable').each(function () {
      var el = this;

      // Jika sudah pernah init, biarkan (hindari double init)
      if ($.fn.DataTable.isDataTable(el)) return;

      $(el).DataTable({
        pageLength: 10,
        lengthChange: true,
        autoWidth: false,
        // responsive: true, // aktifkan jika load plugin responsive
        dom: 'Bfrtip',      // perlu untuk tombol export
        buttons: [
          { extend: 'copy',  className: 'btn btn-light' },
          { extend: 'csv',   className: 'btn btn-light' },
          { extend: 'excel', className: 'btn btn-light' },
          { extend: 'pdf',   className: 'btn btn-light' },
          { extend: 'print', className: 'btn btn-light' }
        ]
      });
    });
  }

  /* --------------------------------
   * 4) Init sekali saat pertama load
   * -------------------------------- */
  bindSidebarToggles();
  initPageUI(document);
  initTables(document);

  /* --------------------------------
   * 5) Expose ke global untuk dipanggil
   *    dari Vue Router afterEach / komponen
   * -------------------------------- */
  window.Porto.bindSidebarToggles = bindSidebarToggles;
  window.Porto.initPageUI        = initPageUI;
  window.Porto.initTables        = initTables;

  // Helper all-in-one
  window.Porto.initAll = function (ctx) {
    bindSidebarToggles();
    initPageUI(ctx);
    initTables(ctx);
  };
})();
