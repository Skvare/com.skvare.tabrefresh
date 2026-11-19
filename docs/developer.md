# Tab Refresh: developer notes

## Overview

The extension adds a refresh button to each contact summary tab without overriding any
core file. It builds on the public API in core's `templates/CRM/common/TabHeader.js`.

```
com.skvare.tabrefresh/
├── info.xml
├── tabrefresh.php               hook_civicrm_pageRun: adds the JS and CSS
├── tabrefresh.civix.php         civix boilerplate (auto-generated)
├── js/tabrefresh.js             the button and the refresh logic
├── css/tabrefresh.css           layout, loaded for every theme
├── css/tabrefresh-riverlea.css  colours and spacing, loaded for Riverlea only
└── docs/
```

## How it hooks into core

| Need | Hook point used |
|---|---|
| Load JS/CSS on the contact summary page | `hook_civicrm_pageRun` for `CRM_Contact_Page_View_Summary` |
| Skip print/PDF/snippet/JSON requests | `CRM_Core_Page::getPrint()` |
| Load after core's `TabHeader.js` | Same region (`html-header`) with a higher weight (10; core uses 1) |
| Know when a tab's content has loaded | The `crmLoad` event, which bubbles from the panel (`js/crm.ajax.js`) |
| Find a tab's panel | `CRM.tabHeader.getTabPanel(tab)` |
| Reload a tab | `CRM.tabHeader.resetTab(tab, true)` |
| Detect unsaved changes | `CRM.utils.initialValueChanged()` |
| Detect Riverlea | `riverlea.style_loader` service (6.7+), else the active theme's `search_order` |

### Page lifecycle

1. `CRM_Contact_Page_View_Summary::run()` calls `view()`, which adds `TabHeader.js`
   (weight 1, `html-header`).
2. `CRM_Core_Page::run()` invokes `hook_civicrm_pageRun`; `tabrefresh_civicrm_pageRun()`
   adds `js/tabrefresh.js` and `css/tabrefresh.css` (weight 10, `html-header`), plus
   `css/tabrefresh-riverlea.css` (weight 11) when Riverlea is active.
3. In the browser, `TabHeader.js` creates the jQuery UI tabs on document ready.
   `tabrefresh.js` registers its ready handler later, so it runs afterwards. In case the
   tabs aren't there yet, it waits for `tabscreate`.

### Ajax tabs

Core loads ajax tabs in its `tabsbeforeload` handler with `CRM.loadPage()` /
`CRM.loadForm()`, targeting the tab panel. Each load replaces the panel's HTML (removing
the button) and then triggers `crmLoad` on the panel.

Rather than reaching into core's `tabsbeforeload` handler, the extension binds one
delegated `crmLoad.tabRefresh` listener on `#mainTabContainer`. It reacts only when
`e.target` is a direct `.ui-tabs-panel` child, so content loaded inside a panel is ignored,
and adds the button back to that panel.

Clicking the button calls `CRM.tabHeader.resetTab(tab, true)`. Because the tab is active,
that calls `$panel.crmSnippet('refresh')`, which reloads the tab's URL.

### Angular tabs (Afform / SearchKit)

These tabs are rendered with the page (`$block.template` in `CRM/common/TabHeader.tpl`),
and their panel contains a `<crm-angular-js>` element. They get a button on page load.

`resetTab()` triggers `crmPopupFormSuccess` on the first form in the panel. SearchKit
displays listen for that event (`searchDisplayBaseTrait`) and re-run their search.
SearchKit fetches through `crmApi4` → `CRM.api4` → `$.post`, so the button waits for
jQuery's `ajaxStop` before it stops spinning.

## JavaScript API

### `CRM.tabRefresh.refreshTab(tab)`

Reloads a tab the same way the button does, including the unsaved-changes prompt.

```js
// Refresh the Activities tab on the contact summary page
CRM.tabRefresh.refreshTab('#tab_activity');
```

`tab` is a selector, element or jQuery object for the tab's `<li>`.

For a plain reload with no prompt or spinner, use core's
`CRM.tabHeader.resetTab(tab, true)` directly.

### Translation

Strings in `js/tabrefresh.js` use `CRM.ts('com.skvare.tabrefresh')`. The file is added
with translation enabled (the default), so CiviCRM extracts its strings automatically.

## CSS classes

| Selector | Element |
|---|---|
| `.tabrefresh` | Wrapper `<div>`, prepended to the tab panel and floated right |
| `.tabrefresh-button` | The `<button>` (also has core's `.crm-button`) |
| `.tabrefresh-button .crm-i.fa-spin` | The icon while the tab is reloading |
| `.tabrefresh-button[disabled]` | The button while the tab is reloading |

Theme or site CSS can restyle these, for example to show a label next to the icon:

```css
.crm-container .tabrefresh-button .sr-only {
  position: static;
  width: auto;
  height: auto;
  margin: 0 0 0 4px;
  overflow: visible;
  clip: auto;
  clip-path: none;
}
```

### Why there are two CSS files

The Riverlea colours come from Riverlea CSS variables (`--crm-secondary-color` and so on).
In Greenwich those variables are undefined, and an undefined `var()` with no fallback makes
the property invalid, which would remove the button's background. So the colour rules are
in a separate file, which `_tabrefresh_is_riverlea_active()` loads only for Riverlea
streams. Layout rules that work everywhere stay in `tabrefresh.css`.

## Coexisting with the core patch

This extension began as a core patch to `TabHeader.js`, `Summary.php` and
`contactSummary.css`, which used a `CRM.tabSettings.refreshButton` setting. If that patch
(or a future core version with the same setting) is present, `tabrefresh.js` does nothing,
so you never get two buttons. To test the extension, remove the core patch first.

## Extending to other tabbed pages

Other pages that use `TabHeader.js` (for example `CRM_Event_Form_ManageEvent`,
`CRM_Contribute_Form_ContributionPage_TabHeader`) use the same `#mainTabContainer` markup.
To add the button there:

- PHP: add the same resources in `hook_civicrm_buildForm` (forms) or for the relevant page
  class in `hook_civicrm_pageRun`.
- JS: no changes needed; the script works with any `#mainTabContainer`.

Test carefully. Some of those tabs submit without ajax ("Save and Done"), and refreshing
them discards unsaved form values (the unsaved-changes prompt covers most cases).

## Manual test checklist

- [ ] Greenwich and a Riverlea stream: the button sits in the top-right of the tab content.
- [ ] Activities tab: add an activity in another browser window, click refresh, the
      activity appears and the tab count updates.
- [ ] Ajax form tab (e.g. a custom field set in edit mode): change a field, click refresh,
      the unsaved-changes prompt appears; **Cancel** keeps the value, **Refresh** discards it.
- [ ] SearchKit/Afform tab: the display re-runs; the icon spins until results load.
- [ ] Keyboard: tab to the button, press <kbd>Enter</kbd>; focus returns to the button.
- [ ] Summary tab: no button.
- [ ] Print Summary (`civicrm/contact/view/print?reset=1&print=1&cid=...`): no button.
- [ ] Summary page in edit mode (`civicrm/contact/view?reset=1&action=update&cid=...`): no tabs, no JS errors.
- [ ] Browser console: no errors on page load or after refresh.
