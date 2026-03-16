So I am trying to change keyboard layout using XKBlib and almost got it
Right now XkbSetNames doesn't work and I don't know why
I guess that I should be changing not groups but symbols, but not sure

We should better analyse XkbGetKeyboard(display, XkbAllComponentsMask, XkbUseCoreKbd); to see what actually changes when I call setxkbmap ...
And we should check if this changes are made after XkbSetNames by calling XkbGetKeyboard again.





Get main loop back on track