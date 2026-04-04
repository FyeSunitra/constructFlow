import { ref, onMounted, onUnmounted } from 'vue'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

function getBreakpoint(w: number): Breakpoint {
  if (w < 768)  return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function useBreakpoint() {
  const breakpoint = ref<Breakpoint>(getBreakpoint(window?.innerWidth ?? 1024))
  const isMobile   = () => breakpoint.value === 'mobile'
  const isTablet   = () => breakpoint.value === 'tablet'
  const isDesktop  = () => breakpoint.value === 'desktop'
  const isMobileOrTablet = () => breakpoint.value !== 'desktop'

  function onResize() {
    breakpoint.value = getBreakpoint(window.innerWidth)
  }

  onMounted(()   => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))

  return { breakpoint, isMobile, isTablet, isDesktop, isMobileOrTablet }
}