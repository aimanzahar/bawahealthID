import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { itemId } = route.params;

  const itemDetails = {
    '1': {
      title: 'First Item',
      description: 'This is the detailed description for the first item.',
      content: 'Here you can add more content about this item. You can include any information you want to display to the user.',
    },
    '2': {
      title: 'Second Item',
      description: 'This is the detailed description for the second item.',
      content: 'This is where you would show more detailed information about the second item. Feel free to customize this content.',
    },
    '3': {
      title: 'Third Item',
      description: 'This is the detailed description for the third item.',
      content: 'Additional details and information can be displayed here for the third item.',
    },
  };

  const item = itemDetails[itemId as keyof typeof itemDetails];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>{item?.title}</Text>
          <Text style={styles.description}>{item?.description}</Text>
          <View style={styles.separator} />
          <Text style={styles.contentTitle}>Details</Text>
          <Text style={styles.contentText}>{item?.content}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetailsScreen;