# PEAR Backend Server Setup

This guide will help you get the PEAR backend server running on your local machine.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or newer is recommended)

## Step 1: Install Dependencies

From inside the `/backend` directory, run the following command to install all the necessary packages:

```bash
npm install
```

## Step 2: (Optional) Set Up Your API Key

The server can run without an API key, but AI-powered features (like generating product descriptions) will be disabled.

1.  Navigate to the `/backend` directory.
2.  Create a new file named `.env`.
3.  Open the `.env` file and add your Google Gemini API key:

    ```
    API_KEY=your_google_gemini_api_key_here
    ```

## Step 3: Start the Server

Once dependencies are installed, start the server with this command:

```bash
npm start
```

## Step 4: Verify the Server is Running

If the server starts successfully, you will see a message in your terminal:

```
Server is running! Check status at http://localhost:3001
```

You can open [http://localhost:3001](http://localhost:3001) in your web browser. You should see `{"message":"PEAR Backend is running!"}`.

Once the server is running, the main web application will connect successfully.
