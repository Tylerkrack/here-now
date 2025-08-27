// import { Button } from "@/components/ui/button"
// import { buttonVariants } from "@/components/ui/button";
import * as React from "react"
import { View, Text, TouchableOpacity, ViewStyle } from "react-native"

export interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void
  disabled?: Date[]
  style?: ViewStyle
}

const Calendar = React.forwardRef<View, CalendarProps>(
  ({ mode = "single", selected, onSelect, disabled, style }, ref) => {
    // Simple calendar implementation for React Native
    return (
      <View ref={ref} style={[{ padding: 16 }, style]}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
          Calendar
        </Text>
        <Text style={{ color: '#6b7280' }}>
          Calendar component coming soon...
        </Text>
      </View>
    )
  }
)

Calendar.displayName = "Calendar"

export { Calendar }
