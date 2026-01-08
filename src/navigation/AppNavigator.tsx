import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import DashboardScreen from '../features/dashboard/DashboardScreen';
import StoreroomListScreen from '../features/stock/StoreroomListScreen';
import StoreroomDetailScreen from '../features/stock/StoreroomDetailScreen';
import { Text } from 'react-native';
import LogsScreen from '../features/logs/LogsScreen';
import StockHistoryScreen from '../features/admin/StockHistoryScreen';
import TasksScreen from '../features/tasks/TasksScreen';
import { LayoutDashboard, Archive, CheckSquare, ClipboardList, Calendar } from 'lucide-react-native';

const AuthStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();
const StoreroomStack = createNativeStackNavigator();

function StoreroomNavigator() {
    return (
        <StoreroomStack.Navigator>
            <StoreroomStack.Screen name="StoreroomList" component={StoreroomListScreen} options={{ title: 'Storerooms' }} />
            <StoreroomStack.Screen name="StoreroomDetail" component={StoreroomDetailScreen} options={({ route }: any) => ({ title: route.params.name })} />
        </StoreroomStack.Navigator>
    );
}

function MainNavigator() {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
        <MainTab.Navigator screenOptions={{ headerShown: false }}>
            <MainTab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
                }}
            />
            <MainTab.Screen
                name="Inventory"
                component={StoreroomNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <Archive color={color} size={size} />
                }}
            />
            <MainTab.Screen
                name="Tasks"
                component={TasksScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />
                }}
            />
            {user?.role === 'admin' && (
                <>
                    <MainTab.Screen
                        name="Logs"
                        component={LogsScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
                        }}
                    />
                    <MainTab.Screen
                        name="History"
                        component={StockHistoryScreen}
                        options={{
                            tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />
                        }}
                    />
                </>
            )}
        </MainTab.Navigator>
    );
}

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

export default function AppNavigator() {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
