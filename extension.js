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
      originalWorkspace: null,
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
    const state = this._trackedState.get(window);

    if (!state)
      return;

    const nowMaximised = this._isMaximised(window);
    const nowFullscreen = window.fullscreen;

    const wasSpecial = state.maximised || state.fullscreen;
    const isSpecial = nowMaximised || nowFullscreen;

    const becameSpecial = !wasSpecial && isSpecial;
    const leftSpecial = wasSpecial && !isSpecial;

    state.maximised = nowMaximised;
    state.fullscreen = nowFullscreen;

    if (becameSpecial)
      this._handleBecameSpecial(window, state);

    if (leftSpecial)
      this._handleLeftSpecial(window, state);
  }

  _handleBecameSpecial(window, state) {
    const workspace = window.get_workspace();

    if (workspace.list_windows().length <= 1)
      return;

    state.originalWorkspace = workspace;

    this._moveToOwnWorkspace(window);
  }

  _handleLeftSpecial(window, state) {
    const workspace = state.originalWorkspace;

    if (!workspace)
      return;

    let stillExists = false;

    for (let i = 0; i < workspaceManager.n_workspaces; i++) {
      if (workspaceManager.get_workspace_by_index(i) === workspace) {
        stillExists = true;
        break;
      }
    }

    if (!stillExists) {
      state.originalWorkspace = null;
      return;
    }

    window.change_workspace(workspace);

    if (window.has_focus())
      workspace.activate(global.get_current_time());

    state.originalWorkspace = null;
  }

  _moveToOwnWorkspace(window) {
    const workspaceManager = global.workspace_manager;

    const currentWorkspace = window.get_workspace();
    const index = currentWorkspace.index();

    workspaceManager.append_new_workspace(false, global.get_current_time());

    const newWorkspace = workspaceManager.get_workspace_by_index(
      workspaceManager.n_workspaces - 2
    );

    workspaceManager.reorder_workspace(newWorkspace, index + 1)

    window.change_workspace(newWorkspace);
    newWorkspace.activate(global.get_current_time());
  }
}
