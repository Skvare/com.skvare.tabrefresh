// https://civicrm.org/licensing
/**
 * Tab Refresh
 *
 * Adds a refresh button to each tab panel on the contact summary page, so a tab's
 * content can be reloaded without reloading the whole page.
 *
 * No core file is overridden: this builds on the public API from core's
 * templates/CRM/common/TabHeader.js (CRM.tabHeader.getTabPanel, CRM.tabHeader.resetTab)
 * and is loaded after it (see tabrefresh_civicrm_pageRun()).
 */
(function($, _) {
  'use strict';

  var ts = CRM.ts('com.skvare.tabrefresh');

  CRM.tabRefresh = CRM.tabRefresh || {};

  $(function() {
    // Core provides the button itself (patched TabHeader.js), so don't add a second one
    if (CRM.tabSettings && CRM.tabSettings.refreshButton) {
      return;
    }
    var $container = $('#mainTabContainer');
    // No tabs on this page, e.g. the contact edit form (action=update)
    if (!$container.length) {
      return;
    }
    // TabHeader.js normally creates the tabs before this runs; wait in case it hasn't yet
    if ($container.hasClass('ui-tabs')) {
      init($container);
    }
    else {
      $container.one('tabscreate', function() {
        init($container);
      });
    }
  });

  /**
   * @param $container jQuery object for #mainTabContainer
   */
  function init($container) {
    // Ajax tabs (Activities, Contributions, ...): the panel content, including the button,
    // is replaced on every load, so the button must be added again after each load.
    // crmLoad bubbles from the panel (see crmSnippet in js/crm.ajax.js), so one delegated
    // listener covers every panel, including ones that haven't been opened yet.
    $container.on('crmLoad.tabRefresh', function(e) {
      var $panel = $(e.target);
      // Ignore content loaded inside a panel, e.g. a nested snippet
      if ($panel.hasClass('ui-tabs-panel') && $panel.parent().is($container)) {
        addRefreshButton(getPanelTab($container, $panel));
      }
    });

    // Angular tabs (Afform, SearchKit) are part of the page and are refreshed in place
    // (see CRM.tabHeader.resetTab), so they get a button straight away.
    // Other inline tabs (e.g. the Summary tab) have nothing to reload and get no button.
    $container.children('ul').children('li').each(function() {
      if (CRM.tabHeader.getTabPanel(this).children('crm-angular-js').length) {
        addRefreshButton(this);
      }
    });
  }

  /**
   * Reload a tab's content, after confirming if it has unsaved changes.
   *
   * @param tab jQuery selector for the tab's <li>
   */
  CRM.tabRefresh.refreshTab = function(tab) {
    var $tab = $(tab),
      $panel = CRM.tabHeader.getTabPanel($tab),
      hadFocus = getRefreshButton($panel).is(':focus');

    function refresh() {
      setRefreshButtonBusy($panel, true);
      CRM.tabHeader.resetTab($tab, true);
      // Wait for the reload to finish. This includes SearchKit displays in Angular tabs,
      // which fetch through crmApi4 -> CRM.api4 -> $.post.
      // An ajax tab's button is replaced along with the content, so this mainly affects Angular tabs.
      if ($.active) {
        $(document).one('ajaxStop', done);
      }
      else {
        done();
      }
    }

    function done() {
      setRefreshButtonBusy($panel, false);
      // Keyboard users should not lose their place when the button is replaced or disabled
      if (hadFocus && (!document.activeElement || document.activeElement === document.body)) {
        getRefreshButton($panel).trigger('focus');
      }
    }

    // Same check core's TabHeader.js makes on 'tabsbeforeactivate'
    if (CRM.utils.initialValueChanged($('form:not([data-warn-changes=false])', $panel))) {
      CRM.confirm({
        title: ts('Unsaved Changes'),
        message: ts('Your changes in the <em>%1</em> tab have not been saved. Refreshing the tab will discard them.', {1: _.escape(getTabTitle($tab))}),
        options: {no: ts('Cancel'), yes: ts('Refresh')}
      }).on('crmConfirm:yes', refresh);
    }
    else {
      refresh();
    }
  };

  /**
   * @param $container jQuery object for #mainTabContainer
   * @param $panel jQuery object
   * @returns jQuery object for the panel's tab <li>
   */
  function getPanelTab($container, $panel) {
    var panelId = $panel.attr('id');
    return $container.children('ul').children('li').filter(function() {
      return $(this).attr('aria-controls') === panelId;
    });
  }

  /**
   * @param tab jQuery selector
   * @returns {string}
   */
  function getTabTitle(tab) {
    return $.trim($(tab).find('a > span').first().text());
  }

  /**
   * @param $panel jQuery object
   * @returns jQuery object
   */
  function getRefreshButton($panel) {
    return $panel.children('.tabrefresh').find('button');
  }

  /**
   * @param $panel jQuery object
   * @param busy {Boolean}
   */
  function setRefreshButtonBusy($panel, busy) {
    getRefreshButton($panel)
      .prop('disabled', busy)
      .find('.crm-i').toggleClass('fa-spin', busy);
  }

  /**
   * Add a refresh button to the top of a tab's panel, if it doesn't already have one
   *
   * @param tab jQuery selector for the tab's <li>
   */
  function addRefreshButton(tab) {
    var $tab = $(tab),
      $panel = CRM.tabHeader.getTabPanel($tab);
    if (!$tab.length || !$panel.length || $panel.children('.tabrefresh').length) {
      return;
    }
    $('<div class="tabrefresh"></div>')
      .append(
        $('<button type="button" class="crm-button tabrefresh-button"></button>')
          .attr('title', ts('Reload the %1 tab', {1: getTabTitle($tab)}))
          .append('<i class="crm-i fa-refresh" role="img" aria-hidden="true"></i>', $('<span class="sr-only"></span>').text(ts('Refresh')))
          .on('click', function() {
            CRM.tabRefresh.refreshTab($tab);
          })
      )
      .prependTo($panel);
  }

})(CRM.$, CRM._);
