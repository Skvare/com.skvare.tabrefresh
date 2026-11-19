<?php
declare(strict_types = 1);

// phpcs:disable PSR1.Files.SideEffects
require_once 'tabrefresh.civix.php';
// phpcs:enable

use CRM_Tabrefresh_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_config/
 */
function tabrefresh_civicrm_config(\CRM_Core_Config $config): void {
  _tabrefresh_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_install
 */
function tabrefresh_civicrm_install(): void {
  _tabrefresh_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_enable
 */
function tabrefresh_civicrm_enable(): void {
  _tabrefresh_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_pageRun().
 *
 * Adds the refresh button script and styles to the contact summary page.
 *
 * This hook fires from CRM_Core_Page::run(), after
 * CRM_Contact_Page_View_Summary::view() has added core's TabHeader.js,
 * so the extension script can be weighted to load after it.
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_pageRun/
 *
 * @param CRM_Core_Page $page
 */
function tabrefresh_civicrm_pageRun(&$page): void {
  // Print, PDF, snippet and JSON requests have no tabs to refresh
  if (!($page instanceof CRM_Contact_Page_View_Summary) || $page->getPrint()) {
    return;
  }

  // Core adds templates/CRM/common/TabHeader.js at weight 1 in html-header;
  // a higher weight in the same region loads this after it.
  $options = ['weight' => 10, 'region' => 'html-header'];
  Civi::resources()
    ->addScriptFile(E::LONG_NAME, 'js/tabrefresh.js', $options)
    ->addStyleFile(E::LONG_NAME, 'css/tabrefresh.css', $options);

  // Riverlea colours come from its CSS variables, which are undefined in other
  // themes (an undefined variable would blank out the button background there).
  if (_tabrefresh_is_riverlea_active()) {
    Civi::resources()->addStyleFile(E::LONG_NAME, 'css/tabrefresh-riverlea.css', ['weight' => 11, 'region' => 'html-header']);
  }
}

/**
 * Is a Riverlea stream the active theme?
 *
 * @return bool
 */
function _tabrefresh_is_riverlea_active(): bool {
  // CiviCRM 6.7+ (also honours the admin-only ?stream_override= preview)
  if (\Civi::container()->has('riverlea.style_loader')) {
    return (bool) \Civi::service('riverlea.style_loader')->isActive();
  }
  // Earlier versions: every Riverlea stream resolves files through the Riverlea base theme
  $themes = \Civi::service('themes');
  $theme = $themes->get($themes->getActiveThemeKey());
  return in_array('_riverlea_core_', $theme['search_order'] ?? [], TRUE);
}
