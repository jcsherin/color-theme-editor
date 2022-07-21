# Color Theme Editor

A web frontend for configuring the custom color palette exported from your Figma/XD/Sketch design files for use with the [Tailwind framework](https://tailwindcss.com/docs/customizing-colors).

- Group multiple shades of the same color together
- Provide human-readable names to each color
- Copy the edited Tailwind configuration to clipboard
  ```js
  // Excerpt of contents copied to clipboard
  module.exports = {
    theme: {
      colors: {
        green: {
          100: "#4caf50",
          200: "#43a047",
          300: "#388e3c",
          400: "#2e7d32",
          500: "#1b5e20",
        },
      },
    },
  };
  ```

[![renaming green colors](/images/screenshot-renaming.png)](https://melted-powder.surge.sh/)

[Click here to try it out](https://melted-powder.surge.sh/)
