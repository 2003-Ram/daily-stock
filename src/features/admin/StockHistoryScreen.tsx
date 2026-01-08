import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDailyStock } from '../stock/stockSlice';
import { RootState } from '../../store';

export default function StockHistoryScreen() {
    const dispatch = useDispatch();
    const { stockHistory, loading, error, storerooms } = useSelector((state: RootState) => state.stock);
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const handleFetch = () => {
        // Format YYYY-MM-DD
        const dateStr = date.toISOString().split('T')[0];
        // @ts-ignore
        dispatch(fetchDailyStock(dateStr));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowPicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const renderRecord = ({ item }: { item: any }) => {
        // item is a DailyStock record for a Storeroom
        // records: { productId: { name, sku }, size, openingStock, closingStock, added, removed }
        const storeroomName = storerooms.find(s => s.id === item.storeroomId)?.name || item.storeroomId;

        return (
            <View style={styles.card}>
                <Text style={styles.storeName}>{storeroomName}</Text>
                {item.records.map((rec: any, idx: number) => (
                    <View key={idx} style={styles.recordRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.prodName}>{rec.productId?.name || 'Unknown'} ({rec.size})</Text>
                            <Text style={styles.sku}>{rec.productId?.sku}</Text>
                        </View>
                        <View style={styles.stats}>
                            <Text style={styles.statText}>In: <Text style={styles.green}>+{rec.added}</Text></Text>
                            <Text style={styles.statText}>Out: <Text style={styles.red}>-{rec.removed}</Text></Text>
                            <Text style={styles.statText}>Close: <Text style={styles.bold}>{rec.closingStock}</Text></Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Stock History</Text>

            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateBtn}>
                    <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleFetch} style={styles.searchBtn}>
                    <Text style={styles.searchBtnText}>Search</Text>
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {loading && <Text style={styles.loading}>Loading...</Text>}
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={stockHistory}
                keyExtractor={(item) => item._id}
                renderItem={renderRecord}
                contentContainerStyle={styles.list}
                ListEmptyComponent={!loading ? <Text style={styles.empty}>No records found for this date.</Text> : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    filterContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
    dateBtn: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
    dateText: { fontSize: 16, color: '#333' },
    searchBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, paddingHorizontal: 20 },
    searchBtnText: { color: '#fff', fontWeight: 'bold' },
    loading: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    error: { textAlign: 'center', marginTop: 20, color: 'red' },
    empty: { textAlign: 'center', marginTop: 20, color: '#777' },
    list: { paddingBottom: 20 },

    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
    storeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    prodName: { fontSize: 16, fontWeight: '600', color: '#333' },
    sku: { fontSize: 12, color: '#999' },
    stats: { flexDirection: 'row', alignItems: 'center' },
    statText: { fontSize: 12, marginLeft: 10, color: '#555' },
    green: { color: 'green', fontWeight: 'bold' },
    red: { color: 'red', fontWeight: 'bold' },
    bold: { fontWeight: 'bold', color: '#333', fontSize: 14 }
});
