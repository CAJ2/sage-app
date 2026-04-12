export const useShowSignIn = () => useState<boolean>('showSignIn', () => false)

export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth()
  const showSignIn = useShowSignIn()

  const requireAuth = (fn: () => void) => {
    if (!isAuthenticated.value) {
      showSignIn.value = true
      return
    }
    fn()
  }

  return { requireAuth }
}
