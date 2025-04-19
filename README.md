# Fitness Tracker Application

## Hosted at :

- **https://axs8276.uta.cloud/**

## Team Members

- _Suresh, Kaushick_ (1002237680)
- _Sivaprakash, Akshay Prassanna_ (1002198274)
- _Sonwane, Pratik_ (1002170610)
- _Shaik, Arfan_ (1002260039)
- _Sheth, Jeet_ (1002175315)

## Login Credentials (For Testing Purposes)

- _Username:_ akshay.prassanna08@gmail.com
- _Password:_ test123

## Frontend Runs on : http://localhost:3001

- Make sure you have Node.js Installed
- Install all required packages at root directoryusing
  npm install
- Run the project using
  npm run start
- Build project using
  npm run build

## Development Flow

### Dashboard :

- Displays key fitness metrics such as weight, steps taken, and calories burned
- Monthly progress visualized using a bar/line chart by selecting metrics weight,steps,calories,workout duration
- weekly activity progress visualized
- Daily activity breakdown shown via a bar chart
- visualizing the workout types
- AI insights to track goals effectively.

### Sign-Up (src/components/Signup.js)

- Users are required to provide First Name, Last Name, Email, and Password
- Registration is managed through Firebase
- Multi-factor authentication is implemented
- Confirmation email is sent to the user's registered email address

### Login (src/components/Login.js)

- Users can log in using their registered email ID and password
- "Forgot Password" functionality is implemented via Firebase

### Activity Logging (src/components/ActivityLogging.js)

- Users can log their daily steps and track them
- Exercise time (active minutes) can be recorded
- AI-driven exercise recommendations based on user needs
- Automatic exercise logging for users with a purchased fitness plan
- Search bar to find exercises based on specific body parts
- Each activity includes a linked YouTube tutorial
- Logged activities can be saved for daily tracking
- Workout data can be exported and imported for progress tracking

### Analytics Visualization (src/components/AnalyticsDashboard.js)

- Data can be filtered based on time frame, metrics, and body parts
- Trend analysis of calories burned over time
- Predictive analytics showcasing actual vs. projected weight trends
- Body part focus visualization for progress tracking
- Exercise difficulty distribution across beginner, intermediate, and advanced levels
- AI-based recommendations based on user activity patterns
- AI-driven fitness insights for improved health and performance

### Nutrition (src/components/Nutrition.js)

- Search functionality to fetch detailed nutritional information of food items
- Users can add food to their meals and track calorie intake
- Meal history can be saved for future reference

### Plans & Subscription (src/components/SubscriptionPayment.js)

- Users can choose between Beginner, Intermediate, and Advanced fitness plans
- Subscription purchase simulation is implemented
- Upon plan purchase, the following features are unlocked:
  - Access to trainer details
  - Book a session with trainer

### Profile (src/components/Profile.js)

- Displays user's personal and fitness-related information
- Users can edit their details as needed
- Target weight and other fitness goals can be set

### Trainer (src/components/Trainer.js)

- Trainer details are displayed
- Users can book training sessions with their assigned trainer

### Contact Us (src/components/ContactUs.js)

- Contact form for users to reach out to the development team
- Displays contact information
- Office location details are provided

### AI Chat :

- Smart assistant to answer user questions, offer guidance, and enhance app interaction.
- we have used Open Router api
