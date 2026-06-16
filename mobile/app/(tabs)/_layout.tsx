import { Tabs } from "expo-router";
import React from "react";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: Platform.OS === "ios" ? 14 : 12,
          height: 72,
          borderRadius: 24,
          backgroundColor: "rgba(15,23,42,0.92)",
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="dark"
            style={{
              flex: 1,
              borderRadius: 24,
              overflow: "hidden",
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="house.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="backup"
        options={{
          title: "Backup",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={24}
              name="icloud.and.arrow.up.fill"
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={24}
              name="person.crop.circle.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
