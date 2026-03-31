export const useShowSignIn = () => useState<boolean>('showSignIn', () => false)

export const useRequireAuth = () => {
  const session = useAuthSession()
  const showSignIn = useShowSignIn()

  const requireAuth = (fn: () => void) => {
    if (!session.value?.data?.user) {
      showSignIn.value = true
      return
    }
    fn()
  }

  return { requireAuth }
}
