// import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
// import { buttonVariants } from "@/components/ui/button"
import * as React from "react"
import { View, Text, TouchableOpacity, Modal, ViewStyle } from "react-native"

export interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export interface AlertDialogContentProps {
  children?: React.ReactNode
  style?: ViewStyle
}

export interface AlertDialogActionProps {
  children?: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

export interface AlertDialogCancelProps {
  children?: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <Modal
      visible={open || false}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  )
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, style }) => {
  return (
    <View style={[{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }, style]}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 20,
        minWidth: 300,
        maxWidth: '90%',
      }}>
        {children}
      </View>
    </View>
  )
}

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[{
        backgroundColor: '#3b82f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 8,
      }, style]}
      onPress={onPress}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[{
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#d1d5db',
      }, style]}
      onPress={onPress}
    >
      {typeof children === 'string' ? (
        <Text style={{ color: '#374151', fontSize: 14, fontWeight: '500' }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  )
}

export { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel }
