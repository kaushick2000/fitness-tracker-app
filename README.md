# Fitness Tracker Application

## Hosted at : 
- **https://axs8276.uta.cloud/**

## Team Members
- **Suresh, Kaushick** (1002237680)
- **Sivaprakash, Akshay Prassanna** (1002198274)
- **Sonwane, Pratik** (1002170610)
- **Shaik, Arfan** (1002260039)
- **Sheth, Jeet** (1002175315)

## Login Credentials (For Testing Purposes)
- **Username:** akshay.prassanna08@gmail.com
- **Password:** test123

## Development Flow

### Home Page (`src/components/HomePage.js`)
- Introduction to the fitness tracker
- Overview of available fitness plans
- User feedback and testimonials
- Links for login and sign-up

### Sign-Up (`src/components/Signup.js`)
- Users are required to provide First Name, Last Name, Email, and Password
- Registration is managed through Firebase
- Multi-factor authentication is implemented
- Confirmation email is sent to the user's registered email address

### Login (`src/components/Login.js`)
- Users can log in using their registered email ID and password
- "Forgot Password" functionality is implemented via Firebase

### Dashboard (`src/components/Dashboard.js`)
- Displays key fitness metrics such as weight, steps taken, and calories burned
- Monthly progress visualized using a pie chart
- Daily activity breakdown shown via a bar chart
- Time spent on exercises represented with a pie chart
- Daily calorie intake and macronutrient breakdown displayed

### Activity Logging (`src/components/ActivityLogging.js`)
- Users can log their daily steps and track them
- Exercise time (active minutes) can be recorded
- AI-driven exercise recommendations based on user needs
- Automatic exercise logging for users with a purchased fitness plan
- "Forgot Password" functionality integrated via Firebase
- Search bar to find exercises based on specific body parts
- Each activity includes a linked YouTube tutorial
- Logged activities can be saved for daily tracking
- Workout data can be exported and imported for progress tracking

### Progress Dashboard (`src/components/ProgressDashboard.js`)
- Visual representation of user progress through interactive charts
- Monthly progress comparison via line and bar charts
- Metrics include weight, steps, calories burned, and workout duration
- AI-generated insights for optimized workouts

### Analytics Visualization (`src/components/AnalyticsDashboard.js`)
- Data can be filtered based on time frame, metrics, and body parts
- Trend analysis of calories burned over time
- Predictive analytics showcasing actual vs. projected weight trends
- Body part focus visualization for progress tracking
- Exercise difficulty distribution across beginner, intermediate, and advanced levels
- AI-based recommendations based on user activity patterns
- AI-driven fitness insights for improved health and performance

### Nutrition (`src/components/Nutrition.js`)
- Search functionality to fetch detailed nutritional information of food items
- Users can add food to their meals and track calorie intake
- Meal history can be saved for future reference

### Plans & Subscription (`src/components/SubscriptionPayment.js`)
- Users can choose between Beginner, Intermediate, and Advanced fitness plans
- Subscription purchase simulation is implemented
- Upon plan purchase, the following features are unlocked:
  - Access to trainer details
  - Automatic addition of activities in the Activity Logging section

### Profile (`src/components/Profile.js`)
- Displays user's personal and fitness-related information
- Users can edit their details as needed
- Target weight and other fitness goals can be set

### Trainer (`src/components/Trainer.js`)
- Trainer details are displayed
- Users can book training sessions with their assigned trainer

### Contact Us (`src/components/ContactUs.js`)
- Contact form for users to reach out to the development team
- Displays contact information
- Office location details are provided
