# # Student Name: Krishna Patel

## 1. My Assigned Work
*Description.html - The description page for a product when clicking on a product.*

*Wishlist.html - The wishlist page of users that can track their wishlisted item in one place*


## 2. AI / LLM Usage
*Did you use an AI tool to help write or debug your code?*

1. *How to make the navbar black using `bg-primary` and `data-bs-theme="dark"` in Lux*

2. *How to make the X button on wishlist items remove the row using `querySelectorAll` and `closest()`*

3. *How to add a notification badge to the cart and wishlist icons in the navbar*

* **How it helped & What I learned:** *(Explain the solution it provided and how you ensured you understood the code).*

1. *In Bootswatch Lux, `bg-primary` maps to `#1a1a1a` (black) instead of blue like default Bootstrap. Adding `data-bs-theme="dark"` tells Bootstrap to render the navbar's text and icons in light colors so they're visible against the dark background.*

2. *QuerySelectorAll('.remove-btn')` selects all X buttons at once and `forEach` attaches a click listener to each one. Inside the listener, `this.closest('.wishlist-row')` walks up the DOM from the clicked button until it finds the parent row, then `.remove()` deletes it from the page without reloading.*

3. *The badge is a `<span>` hidden with `d-none` by default. When the button is clicked, JavaScript removes `d-none` to reveal it, then reads the current count with `parseInt`, increments it by 1, and updates the text. Bootstrap's `position-absolute` with `translate-middle` is what pins the badge to the top corner of the icon.*

## 3. Live Site Link
*Provide the GitHub Pages link to the specific page(s) you built.*
* **Live URL:** 
    
    *Description page - https://vcu-257.github.io/iteration-2-build-with-style-group-11/description.html*

    *Wishlist page - https://vcu-257.github.io/iteration-2-build-with-style-group-11/wishlist.html*