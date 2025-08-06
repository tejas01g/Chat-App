import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase';

export default function ChatScreen({ route }) {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const db = getFirestore(app);
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser || !user) return;
    
    const chatId = [currentUser.uid, user.uid].sort().join('_');
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error('Error listening to messages:', error);
    });
    return unsubscribe;
  }, [user.uid, currentUser]);

  const sendMessage = async () => {
    if (input.trim() && currentUser && user) {
      try {
        const chatId = [currentUser.uid, user.uid].sort().join('_');
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          text: input,
          sender: currentUser.uid,
          createdAt: new Date(),
        });
        setInput('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with {user.name}</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === currentUser.uid ? styles.myMessage : styles.theirMessage]}>
            <Text>{item.text}</Text>
          </View>
        )}
        style={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
  messagesList: { flex: 1 },
  message: { padding: 10, marginVertical: 5, borderRadius: 5, maxWidth: '80%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#eee' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 5 },
});