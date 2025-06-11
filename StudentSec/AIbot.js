import React, { useState, useEffect, useRef } from 'react';
import { 
  View, TextInput, Button, Text, StyleSheet, ScrollView, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { OPENAI_API_KEY } from '@env'; // Import API key from .env file

const API_URL = "https://api.openai.com/v1/chat/completions";

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: "I'm KIMI, your health AI assistant. How may I help you today?", sender: 'bot' },
  ]);
  const [userId, setUserId] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const scrollViewRef = useRef();

  const auth = getAuth();
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const loadMessages = async () => {
        try {
          const storedMessages = await AsyncStorage.getItem(`chatMessages_${userId}`);
          if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
          }
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      };
      loadMessages();
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      const saveMessages = async () => {
        try {
          await AsyncStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
        } catch (error) {
          console.error('Failed to save messages:', error);
        }
      };
      saveMessages();
    }
  }, [messages, userId]);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: input }],
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.choices) {
        const botMessage = { text: data.choices[0].message.content, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error(data.error?.message || "Failed to get a response from AI.");
      }
    } catch (error) {
      console.error('OpenAI API Error:', error);
      setMessages((prevMessages) => [...prevMessages, { text: `Error: ${error.message}`, sender: 'bot' }]);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.messagesContainer}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0078FF',
    color: '#fff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  inputFocused: {
    borderTopColor: '#0078FF',
    borderTopWidth: 2,
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#FFF',
  },
});

export default ChatScreen;
