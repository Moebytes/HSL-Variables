## HSL Variables

<img src="assets/image.png" height="350">

There are many plugins for making HSL adjustments in Figma, but most of them 
edit the variables and styles destructively and replace them with a regular hex color.

This plugin aims to keep your variables and styles intact. Additionally, it makes it easy to 
select only the variables that you wish to target in your selection. Or, you can set it to 
edit every color available on the page.

Supported Edits:
- Variables
- Styles
- Solid fills
- Solid strokes
- Solid effects

### How does it work?

The colors are converted from RGB representation to HSL, where we apply the 
adjustments you asked for, and then it is converted back to RGB. 

### Design

The design for this project is here: https://www.figma.com/design/jaW00nIUAI0Rm4MzCWuNSm/HSL-Variables

### Building

`npm install` \
`npm start` 

### Credits

- [Figma](https://figma.com/)
