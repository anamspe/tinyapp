# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- You'll find yourself in the `Login` page: if you don't have an account, make sure to create one clicking on the `Register` button on the top right.

- My URLs page: contains a list of all the URLs you've shortened so far, starting with the `short URL` code, followed by the `long URL`, `edit button` and `delete button`. Click on the `edit` button to change the long URL that is shortened or on the `delete` button to delete the URL from the list.
  - Shortened link: Click on the `short URL id` to be redirected to the original website.
  - Edit page: if you wish to `edit` the long URL you've shortened, make sure you feed a new URL to the form and click on submit to update it.

- Create New URL: on this page, you're able to `create a short URL` for any link you feed into the form.

> [!IMPORTANT]
> TinyApp's functionalities are restricted to registered users. Make sure you're logged in to have access to all features.

## Routes

- `/urls`: My URLs page - all previously shortened URLs will be stored here.
- `/urls/new`: Create TinyURL page
- `/urls/_short-URL-id_`: "Edit Page: it'll display the original URL, followed by the clickable short URL (that will redirect you to the original website). On the bottom, you'll find the edit URL form.
-`/login`: Login page. Feed your credentials into the form to access the restricted area and all of TinyApp's functionalities.
-`/register`: Register page. Create a new user in case you don't have one to activate TinyApp's functionalities.


Created by Ana Franco, 2023.