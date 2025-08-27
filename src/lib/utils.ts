// React Native utility for merging styles
export function cn(...inputs: any[]) {
  // Filter out undefined/null values and merge styles
  return inputs.filter(Boolean).reduce((merged, current) => {
    if (Array.isArray(current)) {
      return [...merged, ...current.filter(Boolean)]
    }
    return [...merged, current]
  }, [])
}
