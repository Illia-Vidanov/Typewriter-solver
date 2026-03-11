dispatching keyboardevents doesn't work anymore
need to deobfuscate code and check the way they check for input
if isTrusted is used need a way to create such events

Ideas:
- simulate keystrokes via os (separate implementations for different mac linus and windows)
- create this structure via os. Might be some unsafe code will help us