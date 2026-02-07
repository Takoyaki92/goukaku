import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function MainMenuScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>合格（Goukaku!）</Text>

      {/* This is your button code: */}
      <Link href="/quiz/N3" style={styles.button}>
        <Text style={styles.buttonText}>JLPT N3!!!</Text>
      </Link>

      <Link href="/quiz/N2" style={styles.button}>
        <Text style={styles.buttonText}>JLPT N2</Text>
      </Link>

      <Link href="/quiz/N1" style={styles.button}>
        <Text style={styles.buttonText}>JLPT N1</Text>
      </Link>

      <Link href="/review" style={styles.button}>
        <Text style={styles.buttonText}>Review</Text>
      </Link>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Allows the view to take up the whole screen
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 40,
  },
  button: {
      // Basic styling for the Link component
      padding: 15,
      marginVertical: 10,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      width: 200,
      textAlign: 'center',
  },
  buttonText: {
      fontSize: 18,
      fontWeight: '600',
  }
});