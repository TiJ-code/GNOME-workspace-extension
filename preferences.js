import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class Preferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = window.get_settings(
      'org.gnome.shell.extensions.autoworkspacemaximise'
    );

    const page = new Adw.PreferencesPage();

    const group = new Adw.PreferencesGroup({
      title: 'Workspace Behaviour',
    });

    page.add(group);

    group.add(
      this._switch(
        settings,
        'primary-monitor-only',
        'Primary Monitor Only'
      )
    );

    group.add(
      this._switch(
        settings,
        'move-maximised',
        'Move Maximised Windows'
      )
    );

    group.add(
      this._switch(
        settings,
        'move-fullscreen',
        'Move Fullscreen Windows'
      )
    );

    group.add(
      this._switch(
        settings,
        'ignore-skip-taskbar',
        'Ignore hidden windows'
      )
    );

    window.add(page);
  }

  _switch(settings, key, title) {
    const row = new Adw.SwitchRow({ title });

    settings.bind(key, row, 'active', 0);

    return row;
  }
}
