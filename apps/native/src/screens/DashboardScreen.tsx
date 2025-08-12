import { useAuth, useUser } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

const DashboardScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SkillDrill</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <AntDesign name="logout" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.firstName || "User"}!
          </Text>
          <Text style={styles.subtitle}>
            Ready to master your skills with today's drills?
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <AntDesign name="play" size={32} color="#3B82F6" />
              <Text style={styles.actionTitle}>Get Today's Drill</Text>
              <Text style={styles.actionDescription}>
                Get your personalized drill for today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <AntDesign name="barschart" size={32} color="#10B981" />
              <Text style={styles.actionTitle}>View Progress</Text>
              <Text style={styles.actionDescription}>
                Track your improvement over time
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <AntDesign name="plus" size={32} color="#8B5CF6" />
              <Text style={styles.actionTitle}>Add Skill</Text>
              <Text style={styles.actionDescription}>
                Add a new skill to practice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <AntDesign name="setting" size={32} color="#F59E0B" />
              <Text style={styles.actionTitle}>Settings</Text>
              <Text style={styles.actionDescription}>
                Manage your preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>
              No recent activity. Start your first drill!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: RFValue(24),
    fontWeight: "bold",
    color: "#2D2D2D",
  },
  signOutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: RFValue(20),
    fontWeight: "600",
    color: "#2D2D2D",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: RFValue(14),
    color: "#666",
  },
  quickActions: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    color: "#2D2D2D",
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionTitle: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#2D2D2D",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: RFValue(12),
    color: "#666",
    textAlign: "center",
  },
  recentActivity: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityText: {
    fontSize: RFValue(14),
    color: "#666",
    textAlign: "center",
  },
});

export default DashboardScreen;
