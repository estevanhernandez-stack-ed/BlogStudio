**[00:00]** Welcome — today we're building a Claude Code plugin from scratch. By the end you'll have a working `/hello` command and a clear mental model of what plugins actually are.

**[00:30]** Let's start with the directory structure. A plugin is just a folder with a manifest file and one or more capability subdirectories.

**[02:15]** The manifest declares the plugin name, version, and what it provides. Here's the minimum that works.

**[05:00]** Now the slash command. Slash commands live in `commands/<name>.md`. The frontmatter declares it as a command; the prose is what runs when you invoke it.

**[08:30]** Testing locally — we'll symlink the plugin into the install dir so we can iterate without publishing.

**[12:00]** Adding a skill. Skills are similar to commands but trigger automatically based on Claude's read of the description.

**[18:00]** Wrapping up — the full directory layout, common gotchas, and where to look when something doesn't work.

**[21:30]** Thanks for watching. Plugin source is linked in the post above if you want to fork.
