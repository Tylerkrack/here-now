// import { type DialogProps } from "@radix-ui/react-dialog"
// import { Dialog, DialogContent } from "@/components/ui/dialog"
import * as React from "react"
import { View, Text, TextInput, ViewStyle } from "react-native"

export interface CommandProps {
  children?: React.ReactNode
  style?: ViewStyle
}

export interface CommandInputProps {
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  style?: ViewStyle
}

export interface CommandListProps {
  children?: React.ReactNode
  style?: ViewStyle
}

export interface CommandItemProps {
  children?: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

const Command: React.FC<CommandProps> = ({ children, style }) => {
  return (
    <View style={[{ width: '100%' }, style]}>
      {children}
    </View>
  )
}

const CommandInput: React.FC<CommandInputProps> = ({ placeholder, value, onChangeText, style }) => {
  return (
    <TextInput
      style={[{
        height: 40,
        width: '100%',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        color: '#374151',
      }, style]}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChangeText}
    />
  )
}

const CommandList: React.FC<CommandListProps> = ({ children, style }) => {
  return (
    <View style={[{
      maxHeight: 300,
      overflow: 'hidden',
    }, style]}>
      {children}
    </View>
  )
}

const CommandItem: React.FC<CommandItemProps> = ({ children, onPress, style }) => {
  return (
    <View style={[{
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 4,
    }, style]}>
      {typeof children === 'string' ? (
        <Text style={{ fontSize: 14, color: '#374151' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}

export { Command, CommandInput, CommandList, CommandItem }
