import * as React from "react"
import { View, Text, ViewStyle, TextStyle } from "react-native"

export interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children?: React.ReactNode
  style?: ViewStyle
}

const Badge = React.forwardRef<View, BadgeProps>(
  ({ variant = 'default', children, style }, ref) => {
    const badgeStyle = getBadgeStyle(variant)
    const textStyle = getTextStyle(variant)
    
    return (
      <View
        ref={ref}
        style={[badgeStyle, style]}
      >
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </View>
    )
  }
)

Badge.displayName = "Badge"

function getBadgeStyle(variant: string): ViewStyle {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  }

  switch (variant) {
    case 'secondary':
      baseStyle.backgroundColor = '#f3f4f6'
      break
    case 'destructive':
      baseStyle.backgroundColor = '#dc2626'
      break
    case 'outline':
      baseStyle.backgroundColor = 'transparent'
      baseStyle.borderWidth = 1
      baseStyle.borderColor = '#d1d5db'
      break
    default:
      baseStyle.backgroundColor = '#3b82f6'
  }

  return baseStyle
}

function getTextStyle(variant: string): TextStyle {
  const baseStyle: TextStyle = {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  }

  switch (variant) {
    case 'secondary':
      baseStyle.color = '#374151'
      break
    case 'destructive':
      baseStyle.color = '#ffffff'
      break
    case 'outline':
      baseStyle.color = '#374151'
      break
    default:
      baseStyle.color = '#ffffff'
  }

  return baseStyle
}

export { Badge }
