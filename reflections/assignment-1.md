# Assignment 1 reflection

**What was the breakthrough that moved the work forward?**

The breakthrough wasn't a technical one — it was stopping. I had a bloom
filter build well underway, and it was fine: it would have worked, it would
have passed every check. But partway through I realised I couldn't answer a
simple question about it — why would someone looking at this care whether a
hash collision happened? A false positive doesn't mean anything to a reader
because it never touches something they already have a feeling about. A gacha
drought does. The switch to the gacha explainer only happened because I let
myself throw away working code for that reason alone, not because anything
was broken.

**What did this work change about who I want to be as a software developer?**

It sharpened a standard I only had loosely before: a demo isn't done when it
runs, it's done when a reader can check it against something real, including
themselves. The histogram only means anything because it's built from the
same draw logic as the live button, not a plotted curve standing in for it —
and I only trust that because I ran the numbers separately and they matched.
I want to keep asking "can someone check this" before I call something
finished, not just "does it run."
