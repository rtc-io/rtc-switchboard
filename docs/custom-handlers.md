## Writing Custom Command Handlers

When you initialize the switchboard, you are able to provide custom handlers specific commands that you want handled by the switchboard. Imagine instance, that we want our switchboard to do something clever when a sends an `/img` command.

We would create our server to include the custom `img` command handler:

<<< examples/custom-handlers.js

And then we would write a small module for the handler:

<<< examples/handlers/img.js

__NOTE:__ This feature has not yet been implemented in the `3.x` release of rtc-switchboard.
