import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addTask, toggleTask, deleteTask } from './tasksSlice';
import { Trash2, Plus, CheckCircle, Circle } from 'lucide-react-native';

export default function TasksScreen() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const tasks = useSelector((state: RootState) =>
        state.tasks.tasks.filter(t => t.userId === user?.id)
    );

    const [text, setText] = useState('');

    const handleAdd = () => {
        if (!text.trim() || !user) return;
        dispatch(addTask({
            id: Date.now().toString(),
            userId: user.id,
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        }));
        setText('');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => dispatch(toggleTask(item.id))}>
                {item.completed ? <CheckCircle color="#4CAF50" size={24} /> : <Circle color="#999" size={24} />}
            </TouchableOpacity>
            <Text style={[styles.taskText, item.completed && styles.completedText]}>{item.text}</Text>
            <TouchableOpacity onPress={() => dispatch(deleteTask(item.id))}>
                <Trash2 color="#ef5350" size={20} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Tasks</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="New Task..."
                    value={text}
                    onChangeText={setText}
                />
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                    <Plus color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    inputContainer: { flexDirection: 'row', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
    addBtn: { backgroundColor: '#007AFF', width: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    list: { paddingBottom: 20 },
    taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    taskText: { flex: 1, fontSize: 16, marginLeft: 12, color: '#333' },
    completedText: { textDecorationLine: 'line-through', color: '#999' },
});
