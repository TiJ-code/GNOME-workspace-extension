import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class AutoWorkspaceMaximiseExtension extends Extension {
  constructor(metadata) {
    super(metadata);

    this._windowSignals = new Map();
    this._trackedState = new Map();
    this._createdSignal = null;
  }

  enable() {
    for (const window of global.display.get_tab_list(0, null)) {
      this._trackWindow(window);
    }

    this._createdSignal = global.display.connect(
      'window-created',
      (_, window) => this._trackWindow(window)
    );
  }

  disable() {
    if (this._createdSignal) {
      global.display.disconnect(this._createdSignal);
      this._createdSignal = null;
    }

    for (const [window, signals] of this._windowSignals) {
      for (const signal of signals) {
        window.disconnect(signal);
      }
    }

    this._windowSignals.clear();
    this._trackedState.clear();
  }

  _trackWindow(window) {
    if (!window || this._windowSignals.has(window))
      return;

    const maximised = this._isMaximised(window);
    const fullscreen = window.fullscreen;

    if (maximised || fullscreen)
      return;

    const state = {
      maximised: false,
      fullscreen: false,
    };

    this._trackedState.set(window, state);

    const signals = [];

    signals.push(
      window.connect(
        'notify::maximized-horizontally',
        () => this._handleStateChange(window)
      )
    );

    signals.push(
      window.connect(
        'notify::maximized-vertically',
        () => this._handleStateChange(window)
      )
    );

    signals.push(
      window.connect(
        'notify::fullscreen',
        () => this._handleStateChange(window)
      )
    );

    signals.push(
      window.connect(
        'unmanaged',
        () => this._untrackWindow(window)
      )
    );

    this._windowSignals.set(window, signals);
  }

  _untrackWindow(window) {
    const signals = this._windowSignals.get(window);

    if (signals) {
      for (const signal of signals) {
        window.disconnect(signal);
      }
    }

    this._windowSignals.delete(window);
    this._trackedState.delete(window);
  }

  _isMaximised(window) {
    return window.maximized_horizontally && window.maximized_vertically;
  }

  _handleStateChange(window) {
    const previous = this._trackedState.get(window);

    const nowMaximised = this._isMaximised(window);
    const nowFullscreen = window.fullscreen;

    const becameMaximised = !previous.maximised && nowMaximised;

    const becameFullscreen = !previous.fullscreen && nowFullscreen;

    previous.maximised = nowMaximised;
    previous.fullscreen = nowFullscreen;

    if (!becameMaximised && !becameFullscreen)
      return;

    this._moveToOwnWorkspace(window);
  }

  _moveToOwnWorkspace(window) {
    const workspaceManager = global.workspace_manager;

    workspaceManager.append_new_workspace(false, global.get_current_time());

    const workspace = workspaceManager.get_workspace_by_index(
      workspaceManager.n_workspaces - 1
    );

    window.change_workspace(workspace);
    workspace.activate(global.get_current_time());
  }
}
