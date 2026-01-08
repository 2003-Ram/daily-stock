import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchLogs } from './logsSlice';

export default function LogsScreen() {
    const dispatch = useDispatch();
    const { logs, isLoading, error } = useSelector((state: RootState) => state.logs);

    useEffect(() => {
        // @ts-ignore
        dispatch(fetchLogs());
    }, [dispatch]);

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.logCard}>
            <View style={styles.logHeaderRow}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.time}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <Text style={styles.actionText}>
                {item.action}: <Text style={styles.highlight}>{item.quantity} x {item.productName} ({item.size})</Text>
            </Text>
            <Text style={styles.details}>Storeroom: {item.storeroomId}</Text>
        </View>
    );

    if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /></View>;
    if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Activity Log</Text>
            <FlatList
                data={logs}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    error: { color: 'red', fontSize: 16 },
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    list: { paddingBottom: 20 },
    logCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    logHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    username: { fontWeight: 'bold', fontSize: 16, color: '#444' },
    time: { fontSize: 12, color: '#999' },
    actionText: { fontSize: 15, color: '#333', marginBottom: 4 },
    highlight: { fontWeight: '600', color: '#007AFF' },
    details: { fontSize: 13, color: '#777' },
});
