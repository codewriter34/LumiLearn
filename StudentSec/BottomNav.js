import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const BottomMenu = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomMenu}>
      <MenuItem label="Home" icon="home" onPress={() => navigation.navigate('Home')} />
      <MenuItem label="Chat" icon="envelope" onPress={() => navigation.navigate('ChatScreen')} />
      <MenuItem label="Tracker" icon="map" onPress={() => navigation.navigate('Tracker')} />
      <MenuItem label="Fundraising" icon="dollar-sign" onPress={() => navigation.navigate('Fundraising')} />
      <MenuItem label="Profile" icon="user" onPress={() => navigation.navigate('ManageProfile')} />
    </View>
  );
};

const MenuItem = ({ label, icon, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <FontAwesome5 name={icon} size={24} color="black" />
      <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bottomMenu: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingBottom: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    color: 'black',
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BottomMenu;
