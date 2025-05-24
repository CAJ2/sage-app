export default defineNuxtRouteMiddleware((to, from) => {
  const router = useRouter()
  const getDepth = (path: string) => {
    return path.split('/').filter((seg) => seg.length > 0).length
  }
  const toDepth = getDepth(to.path)
  const fromDepth = getDepth(from.path)

  if (toDepth > fromDepth) {
    to.meta.pageTransition = { name: 'page-left' }
    from.meta.pageTransition = { name: 'page-left' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (toDepth < fromDepth || (router.options as any).is_back) {
    to.meta.pageTransition = { name: 'page-right' }
    from.meta.pageTransition = { name: 'page-right' }
  }
  // TODO: Come up with a better way
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(router.options as any).is_back = false
})
