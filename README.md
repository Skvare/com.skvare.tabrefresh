# Tab Refresh (com.skvare.tabrefresh)

Adds a **refresh button** to each tab on the CiviCRM contact summary page, so a tab's
content can be reloaded without reloading the whole page.

This helps when a tab's data changes behind the scenes (a scheduled job adds an activity,
a colleague records a contribution, a webhook updates a membership) and you want to see
the change without losing your place on the contact record.

This is an [extension for CiviCRM](https://docs.civicrm.org/sysadmin/en/latest/customize/extensions/),
licensed under [AGPL-3.0](LICENSE.txt).

## Features

- A small refresh button in the top-right corner of each tab that loads by ajax:
  Activities, Contributions, Memberships, Events, Relationships, Groups, Notes, Change Log,
  custom field set tabs and tabs added by other extensions.
- Also works for Angular tabs (Afform forms and SearchKit displays); their displays are
  re-run in place.
- Warns before discarding unsaved changes in a tab's form.
- The icon spins while the tab reloads, and keyboard focus stays on the button.
- Accessible: the button has a title ("Reload the Activities tab") and screen-reader text.
- Styled for both the Greenwich and Riverlea themes.
- **Does not override any core file.**

## Requirements

- CiviCRM 5.75 or later (Riverlea styling needs 5.80 or later, when Riverlea moved into core)
- PHP 8.0 or later

## Installation

### From a git checkout

```bash
cd /path/to/civicrm/extensions
git clone https://github.com/Skvare/com.skvare.tabrefresh.git
cv en tabrefresh
```

### From the CiviCRM UI

1. Copy the `com.skvare.tabrefresh` folder into your CiviCRM extensions directory.
2. Go to **Administer » System Settings » Extensions**, click **Refresh**, then
   **Install** next to **Tab Refresh**.

No configuration is needed.

## Usage

Open any contact, switch to a tab such as **Activities**, and click the
<i>&#x21bb;</i> button in the top-right corner of the tab. See [docs/index.md](docs/index.md)
for the full user guide.

## How it works

The extension implements `hook_civicrm_pageRun` for `CRM_Contact_Page_View_Summary` and
adds its own JavaScript and CSS after core's `templates/CRM/common/TabHeader.js`. The
script uses core's public `CRM.tabHeader` API (`getTabPanel()`, `resetTab()`) to reload
a tab, and listens for the `crmLoad` event to add the button again each time a tab loads.

See [docs/developer.md](docs/developer.md) for the technical details, the JavaScript API
and the CSS classes.

## Known issues / limitations

- Only the contact summary page gets refresh buttons. Other tabbed pages that use
  `TabHeader.js` (Manage Event, contribution page settings, etc.) are not included yet.
- Inline tabs that are rendered with the page and are not Angular (such as the
  **Summary** tab) don't get a button, since there is nothing for them to reload.
- No button is shown in print view.

## Support

Developed and maintained by [Skvare](https://skvare.com). Please report issues on the
[GitHub issue queue](https://github.com/Skvare/com.skvare.tabrefresh/issues).
