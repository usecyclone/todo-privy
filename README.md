# Cedalio ⨯ To-Do dApp Multi Data Base Example

[Join our Discord Community](https://discord.gg/kSdhmb9UUT)

[![Deploy to Cedalio](https://cedalio.com/images/deploy-schema-button-small.png)]([https://docs.cedalio.com/introduction/getting-started/download-the-cli](https://docs.cedalio.com/studio/project))
</br>

## Privy Account Setup

To handle the signup process for the To-Do app, you'll need to create an account in Privy. Follow these instructions:

1. Go to [privy.io](https://privy.io/) in your web browser.
2. Sign up for an account on the Privy platform.
- Provide the required information, such as your name, email address, and password.
- Follow the instructions to complete the account creation process.
3. Create an app in Privy, later in this example `App Id` will be needed.

## Pusher Configuration

Pusher is used to send messages for database creation status.

## Cedalio Studio Project Creation

To have a database ready to store the To-Do information, you need to create a project in [Cedalio Studio](https://studio.cedalio.com). Here's what you need to do:

1. Signup in Cedalio Studio
2. Create a project and upload the [ToDo Schema]([url](https://github.com/cedalio/todo-privy/blob/main/todo.graphql))
3. Set your Privy `App ID`, in order to define Privy as the auth provider.

## Setting up the To-Do App

Follow these steps to set up the To-Do app:

1. Open the command line and navigate to the root directory of the project.
2. Run the following command to install the necessary dependencies: `npm install`
3. Create a `.env.development` file with the following variables:
  - REACT_APP_PRIVY_APP_ID= Privy `App ID` that is going to be used to validate the [auth process](https://docs.cedalio.com/technology/auth/providers).
  - REACT_APP_PUSHER_KEY=781734cca253fc8f602b
  - REACT_APP_CEDALIO_DOMAIN=gtw.cedalio.io
  - REACT_APP_PROJECT_ID= Cedalio `Project ID` this value is available in the [Cedalio Studio](https://studio.cedalio.com)

4. Then run: `npm start`

## Learn More About Cedalio

To learn more about Cedalio, take a look at the following resources:

- [Cedalio](https://cedalio.com/) - learn about Cedalio Features and Roadmap.

- [Cedalio Docs](https://docs.cedalio.com/) - learn about Cedalio Architecture and CLI.
