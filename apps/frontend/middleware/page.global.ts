export default defineNuxtRouteMiddleware((to, from) => {
  const router = useRouter()
  const getDepth = (path: string) => {
    return path.split('/').filter((seg) => seg.length > 0).length
  }
  const toDepth = getDepth(to.path)
  const fromDepth = getDepth(from.path)
  const setTransition = (name: string) => {
    to.meta.pageTransition = { name }
    from.meta.pageTransition = { name }
  }

  if (toDepth === 1 && fromDepth === 1) {
    const toSeg = to.path.split('/')[1]
    const fromSeg = from.path.split('/')[1]
    setTransition('page-left')
    if (fromSeg === 'explore') {
      setTransition('page-left')
    } else if (fromSeg === 'places') {
      if (toSeg === 'explore') {
        setTransition('page-right')
      }
    } else if (fromSeg === 'search') {
      if (toSeg === 'explore' || toSeg === 'places') {
        setTransition('page-right')
      }
    } else if (fromSeg === 'contribute') {
      if (toSeg !== 'profile') {
        setTransition('page-right')
      }
    } else if (fromSeg === 'profile') {
      setTransition('page-right')
    }
  } else if (toDepth > fromDepth) {
    to.meta.pageTransition = { name: 'page-left' }
    from.meta.pageTransition = { name: 'page-left' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if (toDepth < fromDepth || (router.options as any).is_back) {
    to.meta.pageTransition = { name: 'page-right' }
    from.meta.pageTransition = { name: 'page-right' }
  } else {
    to.meta.pageTransition = { name: 'page-left' }
    from.meta.pageTransition = { name: 'page-left' }
  }
  // TODO: Come up with a better way
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(router.options as any).is_back = false
})
