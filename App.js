// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from './LoadingScreen';
import WelcomeScreen from './WelcomeScreen';
import RegisterScreen from './RegistrationPage';
import StudentHome from './StudentSec/Home';
import CoursesForQuiz from './StudentSec/Quizze/CoursesForQuiz';
import TakeQuiz from './StudentSec/Quizze/CoursesForQuiz';
import QuizScreen from './StudentSec/Quizze/QuizScreen';
import LecturerHome from './LecturerSec/Home';
import CoursesScreen from './LecturerSec/CoursesSec';
import Quizzes from './LecturerSec/QuizzesSec';
import SetQuiz from './LecturerSec/SetQuiz';
import Tracker from './StudentSec/Tracker/TrackerHome';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="StudentSec/Home" component={StudentHome} />
        <Stack.Screen name="LecturerSec/Home" component={LecturerHome} />
        <Stack.Screen name='Course' component={CoursesScreen}
          options={{
            headerShown: true, 
            headerTitle: 'Courses', 
          }}/>
          <Stack.Screen name='Quizzes' component={Quizzes}
          options={{
            headerShown: true, 
            headerTitle: 'Quiz', 
            headerBackTitle: 'Back',
          }}/>
          <Stack.Screen 
          name='SetQuiz' 
          component={SetQuiz}
          options={{
            headerShown: true,
            headerTitle: 'Set Quiz',
            headerBackTitle: 'Back',
              }}
            />
            <Stack.Screen name="CoursesForQuiz" component={CoursesForQuiz}
                      options={{
                        headerShown: true,
                        headerTitle: 'Set Quiz',
                        headerBackTitle: 'Back',
                          }} />
           <Stack.Screen name="TakeQuiz" component={TakeQuiz} />
                
            <Stack.Screen name="QuizScreen" component={QuizScreen} 
                      options={{
                        headerShown: true,
                        headerTitle: 'Set Quiz',
                        headerBackTitle: 'Back',
                          }}/>
            <Stack.Screen name='Tracker' component={Tracker}
            options={{
              headerShown: true,
              headerTitle: 'Set Quiz',
              
                }}
            />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
