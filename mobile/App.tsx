import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import DashboardScreen from './screens/DashboardScreen'

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0a0a12" />
      <DashboardScreen />
    </SafeAreaProvider>
  )
}
