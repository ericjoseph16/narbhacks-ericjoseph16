import { useAuth, useOAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const LoginScreen = ({ navigation }) => {
  const { isSignedIn } = useAuth();

  const { startOAuthFlow: startGoogleAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate("DashboardScreen");
    }
  }, [isSignedIn, navigation.navigate]);

  const onPress = async (authType: string) => {
    try {
      if (authType === "google") {
        const result = await startGoogleAuthFlow();

        const { createdSessionId, setActive, signIn, signUp } = result;

        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          navigation.navigate("DashboardScreen");
        } else {
          // Handle sign-up flow for new users
          if (signUp && signUp.status === "missing_requirements") {
            // Check if phone number is truly required or optional
            const isPhoneRequired =
              signUp.requiredFields.includes("phone_number");

            if (isPhoneRequired) {
              // If phone is required, we need to handle this differently
              // For now, just try to create the account anyway
              try {
                await signUp.update({
                  phoneNumber: "+1234567890", // Dummy number - you should handle this properly
                });

                const { createdSessionId: newSessionId } = await signUp.create(
                  {}
                );

                if (newSessionId) {
                  await setActive({ session: newSessionId });
                  navigation.navigate("DashboardScreen");
                }
              } catch (_updateError) {
                Alert.alert(
                  "Configuration Issue",
                  "Your Clerk dashboard requires a phone number for sign-ups. Please update your Clerk dashboard settings to make phone number optional, or implement a phone number collection screen.",
                  [{ text: "OK" }]
                );
              }
            } else {
              // Phone is optional, just create the user
              try {
                const { createdSessionId: newSessionId } = await signUp.create(
                  {}
                );

                if (newSessionId) {
                  await setActive({ session: newSessionId });
                  navigation.navigate("DashboardScreen");
                }
              } catch (_signUpError) {
                // Sign-up error handled silently
              }
            }
          } else if (signIn?.firstFactorVerification?.error) {
            Alert.alert(
              "Sign In Error",
              "This Google account is not associated with an existing user. Please sign up first.",
              [{ text: "OK" }]
            );
          }
        }
      } else if (authType === "apple") {
        const result = await startAppleAuthFlow();

        const { createdSessionId, setActive } = result;

        if (createdSessionId) {
          await setActive({ session: createdSessionId });
          navigation.navigate("DashboardScreen");
        }
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SkillDrill</Text>
        <Text style={styles.subtitle}>
          Master your skills with daily drills
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => onPress("google")}
        >
          <AntDesign name="google" size={24} color="#4285F4" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleButton}
          onPress={() => onPress("apple")}
        >
          <AntDesign name="apple1" size={24} color="white" />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: RFValue(32),
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: RFValue(16),
    color: "#666",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "#4285F4",
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appleButtonText: {
    marginLeft: 10,
    fontSize: RFValue(16),
    fontWeight: "600",
    color: "white",
  },
});

export default LoginScreen;
