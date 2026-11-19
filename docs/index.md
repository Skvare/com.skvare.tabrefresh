# Tab Refresh: user guide

Tab Refresh adds a refresh button to each tab on the contact summary page. Clicking it
reloads only that tab, so you see the latest data without reloading the whole contact
record.

## Installing

1. Put the `com.skvare.tabrefresh` folder in your CiviCRM extensions directory.
2. Go to **Administer » System Settings » Extensions** and click **Refresh**.
3. Click **Install** next to **Tab Refresh**.

There are no settings. Disabling the extension removes the buttons.

## Using the refresh button

1. Open a contact (**Search » Find Contacts**, then click a contact's name).
2. Switch to the tab you want to update, for example **Activities** or **Contributions**.
3. Click the refresh button (circular arrow icon) in the top-right corner of the tab's content.

While the tab reloads, the icon spins and the button is disabled. When the reload has
finished, the button is ready to use again. The tab's count (the number next to its name)
updates as well, where the tab provides one.

### Which tabs get a button

| Tab type | Examples | Button? |
|---|---|---|
| Tabs loaded on demand | Activities, Contributions, Memberships, Events, Relationships, Groups, Notes, Change Log, custom field set tabs, tabs added by other extensions | Yes, once the tab has been opened |
| Afform / SearchKit tabs | Tabs built with FormBuilder or SearchKit | Yes; the displays re-run their search in place |
| Tabs rendered with the page | **Summary** | No, there is nothing to reload |

The button isn't shown in the printer-friendly view (the contact's **Print Summary** action).

### Unsaved changes

If a tab contains a form with changes you haven't saved, clicking refresh asks first:

> Your changes in the *Volunteer Info* tab have not been saved. Refreshing the tab will discard them.

(*Volunteer Info* stands for whichever tab you are in, for example a custom field set tab
open for editing.)

Choose **Cancel** to keep your changes, or **Refresh** to discard them and reload the tab.

### Keyboard and screen readers

- The button can be reached with <kbd>Tab</kbd> and pressed with <kbd>Enter</kbd> or
  <kbd>Space</kbd>.
- After a reload, focus returns to the button so you don't lose your place.
- Screen readers announce it as "Refresh", and its tooltip names the tab
  (for example, "Reload the Activities tab").

## Themes

The button follows the active CiviCRM theme. With Greenwich it uses the standard CiviCRM
button style; with a Riverlea stream (Minetta, Walbrook, Hackney Brook, Thames, ...) it
uses that stream's secondary button colours and spacing.

## Troubleshooting

**No button appears in a tab.**
- Buttons are added after a tab has loaded. Open the tab first.
- Check the extension is enabled under **Administer » System Settings » Extensions**.
- Clear the CiviCRM cache (**Administer » System Settings » Cleanup Caches**) and your
  browser cache, then reload the contact page.

**Two refresh buttons appear in a tab.**
This means a core patch that adds the same feature is also applied. The extension
normally detects that and steps aside; if it doesn't, remove the core patch (see the
[developer notes](developer.md#coexisting-with-the-core-patch)).

**The tab reloads but the button keeps spinning.**
The button waits for all ajax requests on the page to finish. A long-running request
from another part of the page keeps it busy until that request completes.

## Getting help

Developed and maintained by [Skvare](https://skvare.com). Report issues on the
[GitHub issue queue](https://github.com/Skvare/com.skvare.tabrefresh/issues).
