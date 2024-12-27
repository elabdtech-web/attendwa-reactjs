How to Set Up This Project

To run the frontend of this ReactJS project connected to Firebase, follow these steps:

1. Clone the Repository

Clone this repository to your local machine and navigate to the project directory. 2. Create a Firebase Project

If you don’t already have a Firebase project, follow these steps:

    Go to the Firebase Console.
    Click on "Add Project" and follow the on-screen instructions to create a new project.
    Once the project is created, navigate to Project Settings (gear icon in the top-left corner).
    Scroll down to the "Your Apps" section, click on the "Add App" button, and select the web option.
    Register your app, and Firebase will generate your app credentials.

3. Add Firebase Credentials

   Copy the credentials displayed in the Firebase configuration snippet.

   In the root of your project, create a .env file (if it doesn’t already exist).

   Add the following variables to the .env file and fill in the values from your Firebase project configuration:

   VITE_FIREBASE_KEY="your-firebase-api-key"
   VITE_AUTH_DOMAIN="your-auth-domain"
   VITE_PROJECT_ID="your-project-id"
   VITE_STORAGE_BUCKET="your-storage-bucket"
   VITE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_APP_ID="your-app-id"

4. Install Dependencies

Run the following command to install all required dependencies:

npm install

5. Start the Development Server

Use this command to start the development server:

npm run dev

The terminal will display a localhost URL (e.g., http://localhost:3000). Click on the link or paste it into your browser to view the project.
