import React from 'react';
import AdminDashboard from './AdminSec/AdminDashboard';
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
import ChatScreen from './StudentSec/AIbot';
import Assignments from './LecturerSec/Assignment';
import CoursePerformance from './LecturerSec/CoursePerformance';
import SendFeedback from './LecturerSec/SendFeedback';
import LecturerCourses from './LecturerSec/LecturerCourses';
import StudentAssignment from './StudentSec/StudentAssignment'; 
import ProfileScreen from './StudentSec/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
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
            <Stack.Screen name='ChatScreen' component={ChatScreen}
                                  options={{
                                    headerShown: true,
                                    headerTitle: 'AI BOT',
                                    headerBackTitle: 'Back',
                                      }}
            />
            <Stack.Screen name='Assignment' component={Assignments}
                                  options={{
                                    headerShown: true,
                                    headerTitle: 'Assignment',
                                    headerBackTitle: 'Back',
                                      }}
            />
            <Stack.Screen name='CoursePerformance' component={CoursePerformance}
                                              options={{
                                                headerShown: true,
                                                headerTitle: 'Student Perfomance',
                                                headerBackTitle: 'Back',
                                                  }}
            />
            <Stack.Screen name='SendFeedback' component={SendFeedback}
                                              options={{
                                                headerShown: true,
                                                headerTitle: 'Feedback',
                                                headerBackTitle: 'Back',
                                                  }}
            />
             <Stack.Screen name='LecturerCourses' component={LecturerCourses}
                                              options={{
                                                headerShown: true,
                                                headerTitle: 'Feedback',
                                                headerBackTitle: 'Back',
                                                  }}
            />
            <Stack.Screen name='StudentAssignment' component={StudentAssignment} 
                                              options={{
                                                headerShown: true,
                                                headerBackTitle: 'Back',
                                                  }}
            />
                        <Stack.Screen name='Profile' component={ProfileScreen} 
                                              options={{
                                                headerShown: true,
                                                headerTitle: 'Profile',
                                                headerBackTitle: 'Back',
                                                  }}
            />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
