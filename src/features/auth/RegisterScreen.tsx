import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import { registerUser } from './authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, User } from 'lucide-react-native';

export default function RegisterScreen({ navigation }: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleRegister = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            // @ts-ignore
            await dispatch(registerUser({ username, password, role: 'user' })).unwrap();
            Alert.alert('Success', 'Account created successfully!');
            // Navigator will switch automatically
        } catch (err) {
            Alert.alert('Registration Failed', err as string);
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
                <View style={styles.card}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Daily Stock today</Text>

                    <View style={styles.inputContainer}>
                        <User color="#666" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Username"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Lock color="#666" size={20} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <LinearGradient colors={['#28a745', '#218838']} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={styles.buttonText}>REGISTER</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 5 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 32 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, marginBottom: 16, paddingHorizontal: 16, height: 50, width: '100%' },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: '#333' },
    button: { width: '100%', height: 50, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
    gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    linkText: { color: '#007AFF', marginTop: 20, fontSize: 14, fontWeight: '600' },
});
