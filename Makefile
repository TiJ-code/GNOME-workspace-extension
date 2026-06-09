UUID = auto-workspace-maximise@tij
EXT_DIR = ~/.local/share/gnome-shell/extensions/$(UUID)

all: install enable

install:
	@echo "Installing to $(EXT_DIR)"
	mkdir -p $(EXT_DIR)
	cp extension.js metadata.json $(EXT_DIR)

enable:
	gnome-extensions enable $(UUID)

disable:
	gnome-extensions disable $(UUID)

reload:
	gnome-extensions disable $(UUID)
	sleep 1
	gnome-extensions enable $(UUID)

logs:
	journalctl --user -f -o cat | grep -i $(UUID)

clean:
	rm -fr $(EXT_DIR)
