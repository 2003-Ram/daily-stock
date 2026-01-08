import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { Storeroom } from '../stock/stockSlice';

export default function StoreroomListScreen() {
    const storerooms = useSelector((state: RootState) => state.stock.storerooms);
    const navigation = useNavigation<any>();

    const renderItem = ({ item, index }: { item: Storeroom; index: number }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StoreroomDetail', { storeroomId: item.id, name: item.name })}
        >
            <View style={styles.iconPlaceholder} /> {/* Could be an icon here */}
            <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={storerooms}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f2fd',
        marginRight: 16,
    },
    name: { fontSize: 18, fontWeight: '600', color: '#333' },
    description: { fontSize: 14, color: '#666', marginTop: 4 },
});
