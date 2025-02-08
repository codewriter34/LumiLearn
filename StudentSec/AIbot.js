import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAI from 'openai';
import { getAuth } from 'firebase/auth';

const openai = new OpenAI({
  apiKey: "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", 
});

const ChatScreen = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      text: "I'm KIMI, your health AI assistant. How may I help you today?",
      sender: 'bot',
    },
  ]);

  const [userId, setUserId] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

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

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",  // Use a valid model name
        messages: [{ role: "user", content: input }],
      });

      const botMessage = {
        text: completion.choices[0].message.content,
        sender: 'bot',
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      let errorMessage;
      if (error.response && error.response.status === 429) {
        errorMessage = {
          text: "You have exceeded your quota. Please check your OpenAI plan and billing details.",
          sender: 'bot',
        };
      } else {
        errorMessage = {
          text: `Error communicating with the AI: ${error.message}`,
          sender: 'bot',
        };
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setInput('');
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
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
    padding: 10,
    backgroundColor: '#fff7f8',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1E90FF', 
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#151B54', 
  },
  messageText: {
    color: '#ffffff', 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  inputFocused: {
    marginTop: -10,
    backgroundColor: '#D3D3D3', 
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatScreen;