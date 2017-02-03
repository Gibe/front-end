# Front end

* [CSS](#css)
 * [BEM structure](#css)
 * [Modules](#modules)
* [JavaScript](#javascript)
 * [Modules](#modules-1)
 * [Useful plugins](#useful-plugins)

## CSS

### BEM structure

Consider the following HTML:

```html
<html class="js">
  <body>
  
    <section class="block block--modifier">
      <div class="block__element">
        <p>Lorem ipsum dolar...</p>
      </div>
    </section>
    
  </body>
</html>
```

Here is some suggested SCSS for this block/element/modifier (BEM) combo:

```scss
.block
{
  // display
  display: none;

  // style
  background: $colorOffWhite;
  color: $colorBase;
  @include font-size($fontSize);
  @include line-height($fontHeight);  
  
  // box model
  border: 1px solid $colorDivider;
  margin: 0 0 15px 0;
  outline: 0;
  overflow: hidden;
  padding: 15px;  
  
  // layout
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1;
  
  // css3
  @include transform(skewX(-5deg));
  @include transition(color .2s);  
  
  &__element
  {  
    // style
    color: $colorBase;
    
    // box model
    border-color: $colorWhite;
  }  
  
  @include mq-min($bpDesktop)
  {  
    // style
    @include font-size($fontSize + 2);
    @include line-height($fontHeight + 2);  
    
    // box model
    margin-bottom: 20px;
    padding: 20px;    
  }
  
  &--modifier
  {
    // style
    background: $colorGrey;    
    color: $colorWhite;
    
    // box model
    border-color: $colorDarkGrey;  
  }
  
  .js &
  {
    display: block;
  }
  
}
```

### Modules

* **[Grid](https://github.com/Gibe/front-end/blob/master/scss/modules/_grid.scss)** (with flexbox support)

## JavaScript

### Modules

* **[Popups](https://github.com/Gibe/front-end/blob/master/scripts/modules/popups.js)**

### Useful plugins

* [bxSlider](http://bxslider.com/)
