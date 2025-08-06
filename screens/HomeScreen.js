import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    setCurrentUser(auth.currentUser);
    fetchUsers();
  }, []);

  const fetchUsers = async (searchText = '') => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      // Filter out current user from the list and filter by substring match (case-insensitive)
      const filteredUsers = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.uid !== auth.currentUser?.uid)
        .filter(user =>
          searchText.trim() === '' ||
          (user.name && user.name.toLowerCase().includes(searchText.trim().toLowerCase()))
        );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Onboarding');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Search users by name..."
        value={search}
        onChangeText={text => {
          setSearch(text);
          fetchUsers(text);
        }}
      />
      
      {users.length === 0 ? (
        <Text style={styles.noUsers}>No users found</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userItem}
              onPress={() => navigation.navigate('Chat', { user: item })}
            >
              <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#ff4444', padding: 10, borderRadius: 5 },
  logoutText: { color: 'white', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  userItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  noUsers: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});